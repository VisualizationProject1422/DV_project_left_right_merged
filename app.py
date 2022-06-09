from flask import Flask, render_template, request, jsonify, json
import chartProcess
import csv
import math
from re import A, I
# import preprocess as pre
import pandas as pd
import os
import numpy as np
from flask_sqlalchemy import SQLAlchemy
import jinja_partials
import csv
import datetime as dt


app = Flask(__name__)
app.jinja_env.variable_start_string = '{{ '
app.jinja_env.variable_end_string = ' }}'

app.config.from_object("config")
db = SQLAlchemy(app)
jinja_partials.register_extensions(app)


def getProvDate(prov,date):
    with open('./static/innerData/province_AQI_IAQI/day//'+date+'00.csv', encoding= 'utf-8') as f:
        f_csv = csv.DictReader(f)
        for row in f_csv:
            if row['province'] == prov:

                return(row['AQI'])

def getCityDate(city,date):
    with open('./static/innerData/city_AQI_IAQI/day//'+date+'00.csv', encoding= 'utf-8') as f:
        f_csv = csv.DictReader(f)
        for row in f_csv:
            if row['city'] == city:
                return(row['AQI'])

def getProv(prov):
    i = 0
    aqi = []
    pm2_5 = []
    pm10 = []
    so2 = []
    no2 = []
    co = []
    o3 =[]
    while i in range(6):
        year = str(2013 + i)
        with open('./static/innerData/province_AQI_IAQI/year//'+year+'.csv', encoding= 'utf-8') as f:
            f_csv = csv.DictReader(f)
            for row in f_csv:
                if row['province'] == prov:
                    aqi.append(row['AQI'])
                    pm2_5.append(row['PM2.5_IAQI'])
                    pm10.append(row['PM10_IAQI'])
                    so2.append(row['SO2_IAQI'])
                    no2.append(row['NO2_IAQI'])
                    co.append(row['CO_IAQI'])
                    o3.append(row['O3_IAQI'])
        i += 1
    if aqi != []:
        return [aqi, pm2_5, pm10, so2, no2, co, o3]
    else:
        return 0

def getCity(city):
    i = 0
    aqi = []
    pm2_5 = []
    pm10 = []
    so2 = []
    no2 = []
    co = []
    o3 =[]
    while i in range(6):
        year = str(2013 + i)
        with open('./static/innerData/city_AQI_IAQI/year//'+year+'.csv', encoding= 'utf-8') as f:
            f_csv = csv.DictReader(f)
            for row in f_csv:
                if row['city'] == city:
                    aqi.append(row['AQI'])
                    pm2_5.append(row['PM2.5_IAQI'])
                    pm10.append(row['PM10_IAQI'])
                    so2.append(row['SO2_IAQI'])
                    no2.append(row['NO2_IAQI'])
                    co.append(row['CO_IAQI'])
                    o3.append(row['O3_IAQI'])
        i += 1
    if aqi != []:
        return [aqi, pm2_5, pm10, so2, no2, co, o3]
    else:
        return 0


# index
@app.route('/', methods=['GET'])
@app.route('/index.html', methods=['GET'])
def index():
    year = 2013
    provinces = db.session.execute("SELECT * FROM province order by code")
    # city = request.args.get("city")
    # province = request.args.get("province")
    # print(province)
    return render_template("index.html", provinces=provinces)


# rightPart
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

# leftPart
@app.route('/receive', methods=['GET'])
def receive():
    global layer_time, layer_geo, choose_time, choose_geo
    layer_time = request.args['layer_time']
    layer_geo = request.args['layer_geo']
    choose_time = eval(request.args['choose_time'])
    choose_geo = eval(request.args['choose_geo'])
    # print("后端接收到的数据：/n", layer_time, layer_geo, choose_time, choose_geo)
    # print("后端接收到的数据类型为：/n", type(layer_time), type(layer_geo), type(choose_time), type(choose_geo))
    return "请求成功"

@app.route('/extraction', methods=['GET'])
def extraction():
    global layer_time, layer_geo, choose_time, choose_geo
    extraction_data = chartProcess.choose_extraction(layer_time, layer_geo, choose_time, choose_geo)
    # print('后端extraction处理后的数据为：/n', extraction_data)
    # print('后端extraction处理后的数据类型为：/n', type(extraction_data))
    extraction_json = jsonify(extraction_data)
    return extraction_json

@app.route('/scatter', methods=['GET'])
def scatter():
    global layer_time, choose_time
    scatter_data = chartProcess.all_layer_scatter(layer_time, choose_time, 'city')
    # print('后端scatter处理后的数据为：/n', scatter_data)
    # print('后端scatter处理后的数据类型为：/n', type(scatter_data))
    scatter_json = jsonify(scatter_data)
    return scatter_json

@app.route('/leftMap', methods=['GET'])
def leftMap():
    global layer_time, choose_time
    leftMap_data = chartProcess.all_layer_scatter(layer_time, choose_time, 'province')
    # print('后端leftMap处理后的数据为：/n', leftMap_data)
    # print('后端leftMap处理后的数据类型为：/n', type(leftMap_data))
    # print(len(leftMap_data))
    leftMap_json = jsonify(leftMap_data)
    return leftMap_json

@app.route('/readProvinceCity', methods=['GET'])
def readProvinceCity():
    # print('QQQQQ')
    province_city_data = chartProcess.readProvinceCity()
    # print(province_city_data)
    province_city_json = jsonify(province_city_data)
    return province_city_json

# middlePart
@app.route('/CalenderSetUp', methods=['POST','GET'])
def CalenderSetUp():
    if request.method == 'POST' :
        data = json.loads(request.get_data())
        if data['layer_geo']  == 'province':
            prov = data['prov']
            year = data['year']
            length = dt.date(int(year),12,31)-dt.date(int(year),1,1)
            for i in range(length.days + 1):
                day = dt.date(int(year),1,1) + dt.timedelta(days=i)
                day_str = day.strftime('%Y%m%d')
                data[day_str] = getProvDate(prov,day_str)
        elif data['layer_geo']  == 'city':
            city = data['city']
            year = data['year']
            length = dt.date(int(year),12,31)-dt.date(int(year),1,1)
            for i in range(length.days + 1):
                day = dt.date(int(year),1,1) + dt.timedelta(days=i)
                day_str = day.strftime('%Y%m%d')
                data[day_str] = getCityDate(city,day_str)
    return jsonify(data)

@app.route('/TimelineSetUp', methods=['POST','GET'])
def TimelineSetUp():
    if request.method == 'POST' :
        data = json.loads(request.get_data())
        if data['layer_geo']  == 'province':
            prov = data['prov']
            data['aqi'] = getProv(prov)
        elif data['layer_geo']  == 'city':
            city = data['city']
            data['aqi'] = getCity(city)
    return jsonify(data)

@app.route('/ThemeRiverSetUp', methods=['POST','GET'])
def ThemeRiverSetUp():
    data = {}
    if request.method == 'POST' :
        with open('./static/innerData//theme.csv', encoding= 'utf-8') as f:
            f_csv = csv.DictReader(f)
            i = 0
            for row in f_csv:
                data['ID'+str(i)] = [row['date'], row['value'], row['type']]
                i += 1
    return jsonify(data)

@app.route('/MapSetUp', methods=['POST','GET'])
def MapSetUp():
    if request.method == 'POST' :
        data = json.loads(request.get_data())
        year = int(data['year'])
        for i in data['children']:
            if data['layer_geo']  == 'province':
                if getProv(i['name']) != 0:
                    p = getProv(i['name'])
                    i['value'] = p[0][year-2013]
                    i['PM2_5'] = p[1][year-2013]
                    i['PM10'] = p[2][year-2013] 
                    i['SO2'] = p[3][year-2013] 
                    i['NO2'] = p[4][year-2013] 
                    i['CO'] = p[5][year-2013] 
                    i['O3'] = p[6][year-2013] 
            elif data['layer_geo']  == 'city':
                if getCity(i['name']) != 0:
                    p = getCity(i['name'])
                    i['value'] = p[0][year-2013]
                    i['PM2_5'] = p[1][year-2013]
                    i['PM10'] = p[2][year-2013]
                    i['SO2'] = p[3][year-2013] 
                    i['NO2'] = p[4][year-2013] 
                    i['CO'] = p[5][year-2013] 
                    i['O3'] = p[6][year-2013]


    return jsonify(data)

if __name__ == '__main__':
    app.run()

