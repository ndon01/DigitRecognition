import uuid
from flask import Flask, request, jsonify
import base64
from PIL import Image
from io import BytesIO
from keras.models import load_model
from flask_cors import CORS, cross_origin
import numpy as np
import cv2

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = './images'

# load the model digit_recognition_model.h5
model = load_model('digit_recognition_model.h5')


@app.route('/upload', methods=['POST'])
@cross_origin()
def upload():
    if request.method != 'POST':
        return jsonify({'error': 'Invalid request method'})
    
    # image should be in the body under in dataURL format
    try:
        data = request.json
        dataUrl = data['dataUrl']
        content = dataUrl.split(';')[1]
        image_encoded = content.split(',')[1]
        body = base64.decodebytes(image_encoded.encode('utf-8'))

        image = Image.open(BytesIO(body))
        image.save('./uploads/image.png')
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():
    print('Predicting...')
    if request.method != 'POST':
        return jsonify({'error': 'Invalid request method'})
    
    # image should be in the body under in dataURL format
    try:
        data = request.json
        dataUrl = data['dataUrl']
        content = dataUrl.split(';')[1]
        image_encoded = content.split(',')[1]
        body = base64.decodebytes(image_encoded.encode('utf-8'))

        image = Image.open(BytesIO(body))
        image = image.resize((28, 28))
        image = image.convert('L')
        name = uuid.uuid4().hex
        name = "predict_" + name + ".png"
        print(f'Name: {name}')
        image.save(f'./uploads/{name}')
        image = np.array([image])
        image = np.invert(image)
        image = image / 255.0
        image = image.reshape(1, 28, 28, 1)
        # make prediction
        predictions = model.predict([image])

        print(f'Predictions: {predictions}')
        prediction = np.argmax(predictions)
        print(f'Prediction: {prediction}')

        prediction_array = {}

        for i in range(len(predictions[0])):
            prediction_array[str(i)] = str(predictions[0][i])


        return jsonify({
            'prediction': str(prediction),
            'prediction_array': prediction_array})
        

    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)})

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
