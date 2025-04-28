import os
import io
import base64
from flask import Flask, request, jsonify, render_template
from gtts import gTTS
from groq import Groq

app = Flask(__name__)
client = Groq(api_key="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")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_input', methods=['POST'])
def process_input():
    data = request.get_json()
    user_text = data['text']

    # Process the input using the LLM
    response = client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[
            {"role": "user", "content": user_text}
        ]
    )

    bot_text = response.choices[0].message.content

    # Convert the response to audio and prepare it in-memory
    tts = gTTS(bot_text, lang='en')
    audio_fp = io.BytesIO()
    tts.write_to_fp(audio_fp)
    audio_fp.seek(0)

    # Encode the audio in base64
    audio_base64 = base64.b64encode(audio_fp.read()).decode('utf-8')

    # Return text and audio data
    return jsonify({
        "response": bot_text,
        "audio_data": audio_base64
    })

if __name__ == '__main__':
    app.run(debug=True)

#Hello how are you. I am good.
