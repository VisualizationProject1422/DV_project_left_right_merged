import pandas as pd
import os    
import numpy as np

cities_df=pd.read_csv('py/china_city_list.csv',header=0,usecols=['City_Admaster'],encoding='gbk')
cities = cities_df[['City_Admaster']].to_numpy()
# print(cities)
cities= np.squeeze(cities)
months = ['01','02','03','04','05','06','07','08','09','10','11','12']

# for year in range(2014,2019):
for city in cities:
    print(city)
    #data reading region
    # for month in months:
    path = 'static/innerData/city_AQI_IAQI/day'
    files= os.listdir(path)
    # print(files)
    for year in range(2013,2018):
        output = pd.DataFrame()
        for file in files:
        # print(file)
            if file[0:4]==str(year):
                data=pd.read_csv(path+'/'+file,header=0, sep=',',usecols=['city','AQI','PM2.5_IAQI','PM10_IAQI','SO2_IAQI','NO2_IAQI','CO_IAQI','O3_IAQI'])
                # ft_file = pd.DataFrame()
                # flag = 0
                for i in range(0,len(data)):
                    if data['city'][i] == city:
                        # flag =1
                        output_line = pd.DataFrame({'Date':{0:file[0:4]+'-'+file[4:6]+'-'+file[6:8]},'PM25':{0:data['PM2.5_IAQI'][i]},'PM10':{0:data['PM10_IAQI'][i]},'SO2':{0:data['SO2_IAQI'][i]},'NO2':{0:data['NO2_IAQI'][i]},'CO':{0:data['CO_IAQI'][i]},'O3':{0:data['O3_IAQI'][i]},'AQI':{0:data['AQI'][i]}})
                        continue

                output = pd.concat([output,output_line],ignore_index=True)
                
        if len(output)>1:
            print(output)
            output = output.sort_values(by=["Date"] , ascending=True)
            # # output = output.values.tolist()
            output = output.reset_index(drop=True)
            # print(output)
            output.to_csv('static/data/'+str(year)+'/parallel/year/'+city+'.csv')