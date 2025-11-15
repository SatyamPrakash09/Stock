from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ItemSerializer
from rest_framework.parsers import JSONParser, json
from datetime import date
from .models import *
import requests
from .RtcTokenBuilder import *
import requests


# Create your views here.
@api_view(['GET', 'POST'])
def getAllDetails(request):
    iiitt = Items.objects.all()
    serial = ItemSerializer(iiitt, many=True)
    return Response(serial.data)

import time, base64

def join_agora(request):
    try:
        # ================================
        # 1. YOUR REAL AGORA CREDENTIALS
        # ================================
        RTC_APP_ID = "32fcd2036fdf4f5abddb61964a08756b"    # App ID
        RTC_APP_CERT = "4c8ca49cb57141e6a9b03c528236c1fb"  # PRIMARY CERTIFICATE
        PROJECT_ID = RTC_APP_ID                            # NEW Agora console uses App ID as Project ID
        PROJECT_SECRET = RTC_APP_CERT                      # NEW console uses App Certificate as Project Secret

        CHANNEL = "vjh"
        UID = 0                   # agent can use dynamic uid
        ROLE_PUBLISHER = 1        # you are host

        # ================================
        # 2. GENERATE RTC TOKEN
        # ================================
        expire_seconds = 3600
        current_ts = int(time.time())
        privilege_expired_ts = current_ts + expire_seconds

        rtc_token = RtcTokenBuilder.buildTokenWithUid(
            RTC_APP_ID,
            RTC_APP_CERT,
            CHANNEL,
            UID,
            ROLE_PUBLISHER,
            privilege_expired_ts
        )

        print("RTC TOKEN GENERATED:", rtc_token)   # must start with 007...

        # ================================
        # 3. AUTH FOR AGENT API (VERY IMPORTANT)
        # ================================
        # Basic auth = base64(ProjectID:ProjectSecret)
        # auth_string = f"{PROJECT_ID}:{PROJECT_SECRET}"
        auth_string = f"{PROJECT_ID}:{PROJECT_SECRET}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Content-Type": "application/json",
        }


        # ================================
        # 4. AGENT JOIN REQUEST BODY
        # ================================
        join_payload = {
            "name": "unique_agent",
            "properties": {
                "channel": CHANNEL,
                "token": rtc_token,      # <-- correct RTC token
                "agent_rtc_uid": "0",
                "remote_rtc_uids": ["*"],
                "enable_string_uid": False,
                "idle_timeout": 120,

                # LLM SETTINGS
                "llm": {
                    "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=AIzaSyBZSfV7AAy4FMLBj7k2DZ4q5VhQidx4Ckg",
                    "system_messages": [
                        {
                            "parts": [{"text": "You are a helpful chatbot"}],
                            "role": "user"
                        }
                    ],
                    "max_history": 32,
                    "greeting_message": "Good to see you!",
                    "failure_message": "Hold on a second.",
                    "params": {"model": "gemini-2.0-flash"},
                    "style": "gemini"
                },

                # ASR
                "asr": {"language": "en-US"},

                # TTS
                "tts": {
                    "vendor": "elevenlabs",
                    "params": {
                        "key": "43e7ebe14338046a69fe10696fb448613d088a2f115ffe58103c5e3fd3fea100",
                        "model_id": "eleven_flash_v2_5",
                        "voice_id": "pNInz6obpgDQGcFmaJgB",
                        "sample_rate": 24000
                    }
                }
            }
        }

        # ================================
        # 5. CALL AGORA AGENT JOIN API
        # ================================
        url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{PROJECT_ID}/join"

        response = requests.post(url, headers=headers, json=join_payload)
        print("AGENT JOIN RESPONSE:", response.text)

        # if response.status_code != 200:
        #     return JsonResponse({
        #         "error": "Agora API error",
        #         "status": response.status_code,
        #         "details": response.text
        #     })


        agent_res = response.json()
        print(agent_res.get("agent_id"))
        print(agent_res.get("status"))

        # ================================
        # 6. SEND FRONTEND THE REAL RTC TOKEN
        # ================================
        return JsonResponse({
            "app_id": RTC_APP_ID,
            "channel": CHANNEL,
            "token": rtc_token,                     # REAL RTC TOKEN
            "agent_id": agent_res.get("agent_id"),
            "status": agent_res.get("status")
        })

    except Exception as e:
        print("JOIN ERROR:", e)
        import traceback
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)})


def webhook(request):
    body = json.loads(request.body)
    text = body.get("text", "").lower()

    print("HE SAID:", text)

    # simple intent logic
    if "add item" in text:
        # your db logic here...
        return JsonResponse({"reply":"item added!"})

    # default
    return JsonResponse({"reply":"ok"})


@api_view(['POST'])
def addItem(request):
    data = JSONParser().parse(request)
    serializer = ItemSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["PUT"])
def checkItem(request, name):
    try:
        snippet = Items.objects.get(name=name)
        print(snippet)
    except Items.DoesNotExist:
        return Response({"error": "Item does not exist"}, status=404)
    
    checkit = ItemSerializer(snippet)
    print(checkit)
    return Response(checkit.data, status=200)


@api_view(['PATCH'])
def updateItem(request, name):
    try:
        snippet = Items.objects.get(name=name)
    except Items.DoesNotExist:
        return Response(status=404)
    
    data = JSONParser().parse(request)
    serializer = ItemSerializer(snippet, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def listStockLess(request):
    try:
        sn = Items.objects.filter(stock__lte=5)
        '''
            lte = less than or equal
            gt = greater than
            gte = greater than or equal
        '''
    except:
        return Response(status=404)
    
    checklessSt = ItemSerializer(sn, many=True)
    print(checklessSt)
    
    return Response(checklessSt.data, status=200)
        

def setReorder(request):
    return Response({"Hello": "Shinchan"})

def expiryorNot(request):
    return Response({"Hello": "Shinchan"})



'''
    // 1) call Django join API to get channel + token
  const res = await fetch("https://your-domain.com/join");
  const data = await res.json();

  const appId = data.app_id;     // returned from agora
  const channel = data.channel;
  const token = data.token;

  // 2) join Agora voice channel and publish mic
  const client = AgoraRTC.createClient({mode:"live", codec:"vp8"});
  await client.join(appId, channel, token, null);

  const mic = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([mic]);

  console.log("Mic streaming → Agora agent listening");
'''