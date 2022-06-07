from flask import Flask, render_template, request, jsonify, json
import chartProcess
import csv
import math
from re import A, I
# import preprocess as pre
# import pandas as pd
import os
# import numpy as np
from flask_sqlalchemy import SQLAlchemy
import jinja_partials


app = Flask(__name__)
app.jinja_env.variable_start_string = '{{ '
app.jinja_env.variable_end_string = ' }}'

app.config.from_object("config")
db = SQLAlchemy(app)
jinja_partials.register_extensions(app)


@app.route('/', methods=['GET'])
# def index():
#     return render_template("index.html")
@app.route('/index.html', methods=['GET'])
def index():
    year = 2013
    provinces = db.session.execute("SELECT * FROM province order by code")
    # city = request.args.get("city")
    # province = request.args.get("province")
    # print(province)
    return render_template("index.html", provinces=provinces)

@app.route('/cities/', methods=['GET'])
def get_cities():
    province = request.args.get("province")
    cities = db.session.execute("SELECT * FROM city WHERE provinceCode=:province",{"province":province}) 
    # print(province)
    # render_template("index.html")
    return render_template("partials/cities.html", cities=cities)

@app.route('/areas/', methods=['GET'])
def get_areas():
    return render_template("partials/areas.html")

@app.route('/bub/', methods=['GET'])
def get_bub():
    return render_template("partials/bub.html")

@app.route('/receive', methods=['GET'])
def receive():
    global layer_time, layer_geo, choose_time, choose_geo
    layer_time = request.args['layer_time']
    layer_geo = request.args['layer_geo']
    choose_time = eval(request.args['choose_time'])
    choose_geo = eval(request.args['choose_geo'])
    print("后端接收到的数据：\n", layer_time, layer_geo, choose_time, choose_geo)
    print("后端接收到的数据类型为：\n", type(layer_time), type(layer_geo), type(choose_time), type(choose_geo))
    return "请求成功"

@app.route('/extraction', methods=['GET'])
def extraction():
    global layer_time, layer_geo, choose_time, choose_geo
    extraction_data = chartProcess.choose_extraction(layer_time, layer_geo, choose_time, choose_geo)
    # print('后端extraction处理后的数据为：\n', extraction_data)
    # print('后端extraction处理后的数据类型为：\n', type(extraction_data))
    extraction_json = jsonify(extraction_data)
    return extraction_json

@app.route('/scatter', methods=['GET'])
def scatter():
    global layer_time, choose_time
    scatter_data = chartProcess.all_layer_scatter(layer_time, choose_time, 'city')
    # print('后端scatter处理后的数据为：\n', scatter_data)
    # print('后端scatter处理后的数据类型为：\n', type(scatter_data))
    scatter_json = jsonify(scatter_data)
    return scatter_json

@app.route('/leftMap', methods=['GET'])
def leftMap():
    global layer_time, choose_time
    leftMap_data = chartProcess.all_layer_scatter(layer_time, choose_time, 'province')
    print('后端leftMap处理后的数据为：\n', leftMap_data)
    print('后端leftMap处理后的数据类型为：\n', type(leftMap_data))
    # print(len(leftMap_data))
    leftMap_json = jsonify(leftMap_data)
    return leftMap_json

if __name__ == '__main__':
    app.run()


