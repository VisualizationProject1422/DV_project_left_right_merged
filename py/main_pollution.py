import pandas as pd
import os    
import numpy as np
#year: 2013, index_categorie of Shaanxi Xi'an

year = 2013
months = ['01','02','03','04','05','06','07','08','09','10','11','12']
days = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']
city = '西安市'

cities_df=pd.read_csv('py/china_city_list.csv',header=0,usecols=['City_Admaster'],encoding='gbk')
cities = cities_df[['City_Admaster']].to_numpy()
# print(cities)
cities= np.squeeze(cities)

for year in range(2013,2019):
    for city in cities:

        index_cat = []
        output = pd.DataFrame()
        #data reading region
        for month in months:
            path = '../data/daily_processed/'+str(year)+month
            files= os.listdir(path)
            # print(files)
            output_month = pd.DataFrame()
            for file in files:
                # print(file)
                data=pd.read_csv('../data/daily_processed/'+str(year)+month+'/'+file,header=0, sep=',',usecols=['PM2.5_IAQI','PM10_IAQI','SO2_IAQI','NO2_IAQI','CO_IAQI','O3_IAQI','城市'])
                # print(type(data))
                # print(data)
                ft_file = pd.DataFrame()
                flag = 0
                for i in range(0,len(data)):
                    if data['城市'][i] == city:
                        flag =1
                        # print(data[i:i+1])
                        ft_file = pd.concat([ft_file,data[i:i+1]])
                # print(ft_file)
        #                 # data=data.drop(index = [i],inplace = True)
        # #         # print(data)
        #         a = ft_file.loc[:,'指数类别'].value_counts()
        #         b = a.idxmax()  
        # #         # print(b)
                if flag==1:
                    pm25= ft_file['PM2.5_IAQI'].mean()
                    # print(pm25)
                    pm10= ft_file['PM10_IAQI'].mean()
                    so2= ft_file['SO2_IAQI'].mean()
                    no2= ft_file['NO2_IAQI'].mean()
                    co= ft_file['CO_IAQI'].mean()
                    o3= ft_file['O3_IAQI'].mean()
                    
                    tot = pm25 + pm10 + so2 +no2 + co +o3
                    
                    max_val = max(pm25, pm10, so2, no2, co, o3)
                    if max_val==pm25:
                        max_pol = 'PM25'
                    if max_val==pm10:
                        max_pol = 'PM10'
                    if max_val==so2:
                        max_pol = 'SO2'
                    if max_val==no2:
                        max_pol = 'NO2'    
                    if max_val==co:
                        max_pol = 'CO'
                    if max_val==o3:
                        max_pol = 'O3'
                    
                    output_line = pd.DataFrame({'Date':{0:file[30:34]+'-'+file[34:36]+'-'+file[36:38]},'Year':{0:file[30:34]},'Month':{0:file[34:36]},'Day':{0:file[36:38]},'MAX_val':{0:max_val},'MAX_name':{0:max_pol}})
                    output = pd.concat([output,output_line],ignore_index=True)
        if flag==1:
        # print(output)
            output = output.sort_values(by=["Date"] , ascending=True)
            # # output = output.values.tolist()
            output = output.reset_index(drop=True)
            print(output)
            output.to_csv('static/data/'+str(year)+'/spiral/year/'+city+'.csv')
            