from flask import Flask, request, jsonify
from flask_cors import cross_origin
import os
from modelscope.models.cv.face_reconstruction.utils import write_obj
from modelscope.outputs import OutputKeys
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
import uuid

app = Flask(__name__)

# 确保有一个用于存储生成文件的目录
UPLOAD_FOLDER = 'generated'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/generate-head', methods=['POST'])
def generate_head():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # 生成唯一的文件名
        filename = str(uuid.uuid4()) + '.jpg'
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # 使用 ModelScope 进行头部重建
        head_reconstruction = pipeline(Tasks.head_reconstruction, model='damo/cv_HRN_head-reconstruction', model_revision='v0.1')
        result = head_reconstruction(filepath)

        # 保存结果
        obj_filename = filename.replace('.jpg', '.obj')
        obj_filepath = os.path.join(UPLOAD_FOLDER, obj_filename)
        
        mesh = result[OutputKeys.OUTPUT]['mesh']
        texture_map = result[OutputKeys.OUTPUT_IMG]
        mesh['texture_map'] = texture_map
        write_obj(obj_filepath, mesh)

        # 返回生成的 OBJ 文件的 URL
        obj_url = f'/generated/{obj_filename}'
        return jsonify({'obj_url': obj_url}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)