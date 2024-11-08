import os
from flask import Flask, request, jsonify, render_template, send_from_directory, url_for
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
        model="mixtral-8x7b-32768",  # Groq's Mixtral model
        messages=[
            {"role": "user", "content": user_text}
        ]
    )

    bot_text = response.choices[0].message.content

    # Convert the response to audio and save it to the static folder
    audio_path = os.path.join('static', 'response.mp3')
    tts = gTTS(bot_text, lang='en')
    tts.save(audio_path)

    # Return text and audio URL
    return jsonify({
        "response": bot_text,
        "audio_url": url_for('static', filename='response.mp3')
    })

# Serve the audio file from the static folder
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True)