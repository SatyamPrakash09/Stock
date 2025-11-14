// import AgoraRTC from "agora-rtc-sdk-ng";

// async function startAssistant() {
//     // 1) Call Django backend to get Agora join info
//     const res = await fetch("https://your-domain.com/join_agora");
//     const data = await res.json();

//     const appId = data.app_id; 
//     const channel = data.channel;
//     const token = data.token;

//     // 2) Create Agora client
//     const client = AgoraRTC.createClient({
//         mode: "live",
//         codec: "vp8"
//     });

//     // 3) Join the channel
//     await client.join(appId, channel, token, null);

//     // 4) Capture microphone audio
//     const micTrack = await AgoraRTC.createMicrophoneAudioTrack();

//     // 5) Publish mic audio → agent listens → sends text to Django webhook
//     await client.publish([micTrack]);

//     console.log("🎤 Microphone streaming → Agora AI Agent is listening...");
// }

// startAssistant();


import AgoraRTC, {
    IAgoraRTCRemoteUser,
    ILocalAudioTrack
} from "agora-rtc-sdk-ng";

let client: any = null;
let micTrack: ILocalAudioTrack | null = null;

export async function startAssistant() {
    let data: any = null; // Store data for error handling
    try {
        console.log('🔄 Fetching join data from backend...');
        const res = await fetch("http://127.0.0.1:8000/join/", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            // Try to get error message from response
            let errorMessage = `HTTP error! status: ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage = errorData.error || errorMessage;
                console.error('❌ Backend error details:', errorData);
            } catch (e) {
                // If response is not JSON, use status text
                errorMessage = `${res.status} ${res.statusText}`;
            }
            throw new Error(errorMessage);
        }

        data = await res.json();
        console.log('✅ Received data from backend:', data);
        
        // Log all received fields
        console.log('🔍 App ID being used:', data.app_id);
        console.log('🔍 Channel being used:', data.channel);
        console.log('🔍 Token being used:', data.token ? 'Present' : 'Missing');
        
        // Verify and log agent_id
        if (data.agent_id) {
            console.log('🤖 Agent ID received:', data.agent_id);
        } else {
            console.warn('⚠️ Agent ID not found in response. Available keys:', Object.keys(data));
        }
        
        if (data.status) {
            console.log('📊 Agent Status:', data.status);
        }
        
        // Validate required fields
        if (!data.app_id || !data.channel || !data.token) {
            throw new Error('Missing required data from backend: app_id, channel, or token');
        }
        
        // Warn if agent_id is missing (but don't fail - it's not required for RTC connection)
        if (!data.agent_id) {
            console.warn('⚠️ Warning: agent_id not received from backend. This may affect agent tracking.');
        }

        // Validate app_id format (should be 32 hex characters)
        if (data.app_id.length !== 32 || !/^[0-9a-fA-F]{32}$/.test(data.app_id)) {
            console.error('⚠️ Invalid App ID format:', data.app_id);
            throw new Error(`Invalid App ID format. Expected 32 hex characters, got: ${data.app_id}`);
        }

        client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        client.setClientRole("host");

        // Type-safe event listener
        client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
            await client.subscribe(user, mediaType);

            if (mediaType === "audio" && user.audioTrack) {
                user.audioTrack.play();
                console.log("AI Voice is playing...");
            }
        });

        console.log('🔄 Attempting to join Agora channel with:', {
            appId: data.app_id,
            channel: data.channel,
            token: data.token ? 'Present' : 'Missing',
            agentId: data.agent_id || 'Not provided'
        });
        
        await client.join(data.app_id, data.channel, data.token, null);
        
        // Log successful connection with agent info
        if (data.agent_id) {
            console.log(`✅ Connected to Agora. Agent ID: ${data.agent_id}, Status: ${data.status || 'Unknown'}`);
        } else {
            console.log('✅ Connected to Agora channel');
        }

        micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([micTrack]);

        console.log("🎤 Listening...");
    } catch (error: any) {
        console.error('❌ Error in startAssistant:', error);
        
        // Check for the specific "invalid vendor key" error
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('invalid vendor key') || errorMessage.includes('can not find appid')) {
            const helpfulError = new Error(
                'Invalid App ID Configuration\n\n' +
                'The App ID being used is not valid for Agora RTC SDK.\n\n' +
                'To fix this:\n' +
                '1. Go to https://console.agora.io/\n' +
                '2. Find your RTC App ID (32 hex characters)\n' +
                '3. Set ACTUAL_RTC_APP_ID in Backend/stockkk/views.py\n\n' +
                'Current App ID: ' + (data?.app_id || 'unknown')
            );
            console.error('🔧 Configuration Issue:', helpfulError.message);
            throw helpfulError;
        }
        
        throw error;
    }
}

export async function stopAssistant() {
    if (micTrack) {
        micTrack.stop();
        micTrack.close();
        micTrack = null;
    }
    if (client) {
        await client.leave();
    }
    console.log("🛑 Stopped Listening");
}
