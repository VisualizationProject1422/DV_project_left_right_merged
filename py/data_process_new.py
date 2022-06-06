from unicodedata import category
import pandas  as pd
import sys
import requests
import geocoder
from geopy.geocoders import Nominatim

def iaqi(n1, n2, n3, n4, p):
    return((n2-n1)/(n4-n3)*(p-n3)+n1)

def IAQI(p, n):
    match n:
        case 1:# PM2.5 24h
            if 0 <= p <= 35:
                return iaqi(0, 50, 0, 35, p)
            elif 35 < p <= 75:
                return iaqi(50, 100, 35, 75, p)
            elif 75 < p <= 115:
                return iaqi(100, 150, 75, 115, p)
            elif 115 < p <= 150:
                return iaqi(150, 200, 115, 150, p)
            elif 150 < p <= 250:
                return iaqi(200, 300, 150, 250, p)
            elif 250 < p <= 350:
                return iaqi(300, 400, 250, 350, p)
            elif 350 < p <= 500:
                return iaqi(400, 500, 350, 500, p)
            else :
                return -1
        case 2:# PM10 24h
            if 0 <= p <= 50:
                return iaqi(0, 50, 0, 50, p)
            elif 50 < p <= 150:
                return iaqi(50, 100, 50, 150, p)
            elif 150 < p <= 250:
                return iaqi(100, 150, 150, 250, p)
            elif 250 < p <= 350:
                return iaqi(150, 200, 250, 350, p)
            elif 350 < p <= 420:
                return iaqi(200, 300, 350, 420, p)
            elif 420 < p <= 500:
                return iaqi(300, 400, 420, 500, p)
            elif 500 < p <= 600:
                return iaqi(400, 500, 500, 600, p)
            else :
                return -1
        case 3:#SO2 first 1h then 24h,但这里就是24h
            if 0 <= p <= 50:
                return iaqi(0, 50, 0, 50, p)
            elif 50 < p <= 150:
                return iaqi(50, 100, 50, 150, p)
            elif 150 < p <= 475:
                return iaqi(100, 150, 150, 475, p)
            elif 475 < p <= 800:
                return iaqi(150, 200, 475, 800, p)
            elif 800 < p <= 1600:
                return iaqi(200, 300, 800, 1600, p)
            elif 1600 < p <= 2100:
                return iaqi(300, 400, 1600, 2100, p)
            elif 2100 < p <= 2620:
                return iaqi(400, 500, 2100, 2620, p)
            else :
                return -1
        case 4:#NO2 24h
            if 0 <= p <= 40:
                return iaqi(0, 50, 0, 40, p)
            elif 40 < p <= 80:
                return iaqi(50, 100, 40, 80, p)
            elif 80 < p <= 180:
                return iaqi(100, 150, 80, 180, p)
            elif 180 < p <= 280:
                return iaqi(150, 200, 180, 280, p)
            elif 280 < p <= 565:
                return iaqi(200, 300, 280, 565, p)
            elif 565 < p <= 750:
                return iaqi(300, 400, 565, 750, p)
            elif 750 < p <= 940:
                return iaqi(400, 500, 750, 940, p)
            else :
                return -1
        case 5:#CO 24h
            if 0 <= p <= 2:
                return iaqi(0, 50, 0, 2, p)
            elif 2 < p <= 4:
                return iaqi(50, 100, 2, 4, p)
            elif 4 < p <= 14:
                return iaqi(100, 150, 4, 14, p)
            elif 14 < p <= 24:
                return iaqi(150, 200, 14, 24, p)
            elif 24 < p <= 36:
                return iaqi(200, 300, 24, 36, p)
            elif 36 < p <= 48:
                return iaqi(300, 400, 36, 48, p)
            elif 48 < p <= 60:
                return iaqi(400, 500, 48, 60, p)
            else :
                return -1
        case 6:#O3 8h
            if 0 <= p <= 100:
                return iaqi(0, 50, 0, 100, p)
            elif 100 < p <= 160:
                return iaqi(50, 100, 100, 160, p)
            elif 160 < p <= 215:
                return iaqi(100, 150, 160, 215, p)
            elif 215 < p <= 265:
                return iaqi(150, 200, 215, 265, p)
            elif 265 < p <= 800:
                return iaqi(200, 300, 265, 800, p)
            elif 800 < p <= 1000:
                return iaqi(300, 400, 800, 1000, p)
            elif 1000 < p <= 1200:
                return iaqi(400, 500, 1000, 1200, p)
            else :
                return -1    

def pollution_state(max):
    if 0<=max<=50:
        level='一级'
        category='优'
    if 50<max<=100:
        level='二级'
        category='良'
    if 100<max<=150:
        level='三级'
        category='轻度污染'
    if 150<max<=200:
        level='四级'
        category='中度污染'
    if 200<max<=300:
        level='五级'
        category='重度污染'
    if max > 300:
        level='六级'
        category='严重污染'
    return level, category
    
if __name__ == "__main__":  
    # data = pd.read_csv("../data/daily/201301/CN-Reanalysis-daily-2013010900.csv")
    pro_city = pd.read_csv('./province_city.csv')
    data = pd.read_csv(sys.argv[1])
    # print(data)
    label = ['PM2.5(微克每立方米)',' PM10(微克每立方米)',' SO2(微克每立方米)',' NO2(微克每立方米)',' CO(毫克每立方米)',' O3(微克每立方米)',' U(m/s)',' V(m/s)',' TEMP(K)',' RH(%)',' PSFC(Pa)',' lat',' lon']
    label_new = ['PM2.5_IAQI','PM10_IAQI','SO2_IAQI','NO2_IAQI','CO_IAQI','O3_IAQI']
    
    for line in range(0,len(data)):
        max = 0
        for i in range(0,6):
            data.loc[line, label_new[i]] = IAQI(data[label[i]][line], i+1)
            if data[label_new[i]][line]>max:
                max = data[label_new[i]][line]
                max_name = label_new[i]
        data.loc[line, 'AQI'] = max
        data.loc[line, '首要污染物'] = max_name
        data.loc[line,'指数级别'], data.loc[line,'指数类别']= pollution_state(max)
        
        # if line % 100 == 0:
        #     print(line)
        # print(line)
    data = pd.concat([data, pro_city], axis=1)
    data.to_csv(sys.argv[2])
    # data.to_csv('/Users/liushiyi/Desktop/2021-2022 SPRING/ARTS 1422 Data Visualization/project/project/data/daily_processed/201301/processed_CN-Reanalysis-daily-2013010900.csv')
    