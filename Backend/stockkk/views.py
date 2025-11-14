from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ItemSerializer
from rest_framework.parsers import JSONParser, json
from datetime import date
from .models import *
import requests
import base64

# Create your views here.
@api_view(['GET', 'POST'])
def getAllDetails(request):
    iiitt = Items.objects.all()
    serial = ItemSerializer(iiitt, many=True)
    return Response(serial.data)


def join_agora(request):
    """
    IMPORTANT CONFIGURATION NOTE:
    =============================
    This function requires your Agora RTC App ID to work correctly.
    
    The error "invalid vendor key, can not find appid" means the App ID is wrong.
    
    HOW TO FIX:
    1. Go to https://console.agora.io/
    2. Log in and navigate to your project
    3. Find the "App ID" field (32 hex characters like: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6)
    4. This is DIFFERENT from the Project ID used in the API URL
    5. Set ACTUAL_RTC_APP_ID variable below with your real App ID
    
    The Project ID (used in the API URL) and RTC App ID are DIFFERENT values!
    """
    try:
        url = "https://api.agora.io/api/conversational-ai-agent/v2/projects/a4d81d8441ae40299687dff600692773/join"

        headers = {
            "Authorization": "Basic ZWFlODBmNGVhNThjNDYzYWI0Y2NjZjYzOGI5NTk5ODY6NjVkZjQyNTM3NmQyNGY0ODhlY2M1YWZjOWRiM2Y0OTg=",
            "Content-Type": "application/json"
        }

        data = {
            "name": "unique_name",
            "properties": {
                "channel": "convai__9xQgF",
                "token": "a7af7c5873db4328b600f68a4367bae5",
                "agent_rtc_uid": "0",
                "remote_rtc_uids": ["*"],
                "enable_string_uid": False,
                "idle_timeout": 120,
                "llm": {
                    "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=AIzaSyBZSfV7AAy4FMLBj7k2DZ4q5VhQidx4Ckg",
                    "system_messages": [
                        {
                            "parts": [
                                {
                                    "text": "You are a helpful chatbot"
                                }
                            ],
                            "role": "user"
                        }
                    ],
                    "max_history": 32,
                    "greeting_message": "Good to see you!",
                    "failure_message": "Hold on a second.",
                    "params": {
                        "model": "gemini-2.0-flash"
                    },
                    "style": "gemini"
                },
                "asr": {
                    "language": "en-US"
                },
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

        r = requests.post(url, headers=headers, data=json.dumps(data))
        
        # Check if the request was successful
        if r.status_code != 200:
            error_msg = f"Agora API returned status {r.status_code}: {r.text}"
            print(f"❌ {error_msg}")
            return JsonResponse({"error": error_msg, "status_code": r.status_code}, status=500)
        
        try:
            agora_response = r.json()
        except Exception as e:
            error_msg = f"Failed to parse Agora API response: {str(e)}. Response: {r.text}"
            print(f"❌ {error_msg}")
            return JsonResponse({"error": error_msg}, status=500)
        print(f"Agora API Response: {agora_response}")  # Debug logging
        print(f"Agora API Response Keys: {list(agora_response.keys())}")  # Debug logging
        
        # Extract App ID from Authorization header (base64 encoded AppID:AppCertificate)
        # The Authorization header format is "Basic <base64(AppID:AppCertificate)>"
        auth_header = headers["Authorization"].replace("Basic ", "")
        app_id_from_auth = None
        try:
            decoded_auth = base64.b64decode(auth_header).decode('utf-8')
            app_id_from_auth = decoded_auth.split(':')[0]  # First part is App ID
            print(f"Extracted App ID from auth: {app_id_from_auth} (length: {len(app_id_from_auth)})")
        except Exception as e:
            print(f"Could not decode auth header: {e}")
        
        # Try to get app_id from various possible fields in Agora response
        app_id = (
            agora_response.get("app_id") or 
            agora_response.get("appId") or 
            agora_response.get("appID") or
            agora_response.get("rtc_app_id") or
            agora_response.get("rtcAppId")
        )
        
        # If not in response, use the one from auth header
        if not app_id:
            app_id = app_id_from_auth
            print(f"Using App ID from auth header: {app_id}")
        else:
            print(f"Using App ID from Agora response: {app_id}")
        
        # IMPORTANT: You need to set your actual RTC App ID here
        # This is DIFFERENT from the Project ID used in the API URL
        # The App ID from auth header might be for API auth, not RTC SDK
        # To find your RTC App ID:
        # 1. Go to https://console.agora.io/
        # 2. Navigate to your project
        # 3. Look for "App ID" (32 hex characters) - NOT the Project ID
        # 4. Replace the value below with your actual RTC App ID
        # Set to None to use the one from auth header, or set your actual RTC App ID
        ACTUAL_RTC_APP_ID = "566f32fb7efb4f21912b094c08c98e67"  # RTC App ID from Agora Console
        AGORA_APP_CERTIFICATE = "89b4ef159aff4e17a11bedbcbaa939b3"  # App Certificate (for token generation if needed)
        # Example: ACTUAL_RTC_APP_ID = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
        
        # Priority: Use configured RTC App ID if set, otherwise use extracted one
        if ACTUAL_RTC_APP_ID:
            print(f"✅ Using configured RTC App ID: {ACTUAL_RTC_APP_ID}")
            app_id = ACTUAL_RTC_APP_ID
        elif not app_id or len(app_id) != 32:
            print(f"⚠️ WARNING: App ID '{app_id}' may be invalid. Expected 32 hex characters.")
            # This fallback is likely WRONG - it's the project ID, not the RTC App ID
            app_id = "a4d81d8441ae40299687dff600692773"
            print(f"⚠️ WARNING: Using fallback App ID (likely incorrect): {app_id}")
            print(f"⚠️ ERROR: You MUST set ACTUAL_RTC_APP_ID in views.py with your real RTC App ID!")
            print(f"⚠️ The Project ID '{app_id}' is NOT the same as the RTC App ID!")
        else:
            print(f"⚠️ Using App ID from auth header: {app_id}")
            print(f"⚠️ NOTE: If you get 'invalid vendor key' error, this App ID might be wrong.")
            print(f"⚠️ Set ACTUAL_RTC_APP_ID with your actual RTC App ID from Agora Console.")
        
        # Extract or construct the response in the format frontend expects
        # The frontend needs: app_id, channel, token
        response_data = {
            "app_id": app_id,
            "channel": agora_response.get("channel") or data["properties"]["channel"],
            "token": agora_response.get("token") or data["properties"]["token"],
        }
        
        # Include agent_id and other fields from Agora response
        if "agent_id" in agora_response:
            response_data["agent_id"] = agora_response["agent_id"]
            print(f"✅ Agent ID created: {agora_response['agent_id']}")
        if "agent_rtc_uid" in agora_response:
            response_data["agent_rtc_uid"] = agora_response["agent_rtc_uid"]
        if "remote_rtc_uids" in agora_response:
            response_data["remote_rtc_uids"] = agora_response["remote_rtc_uids"]
        if "status" in agora_response:
            response_data["status"] = agora_response["status"]
        
        print(f"Formatted Response: {response_data}")  # Debug logging
        return JsonResponse(response_data)
    except requests.exceptions.RequestException as e:
        error_msg = f"Error calling Agora API: {str(e)}"
        print(f"❌ {error_msg}")
        import traceback
        print(traceback.format_exc())
        return JsonResponse({"error": error_msg, "type": "RequestException"}, status=500)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"❌ {error_msg}")
        import traceback
        print(traceback.format_exc())
        return JsonResponse({"error": error_msg, "type": "Exception"}, status=500)


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