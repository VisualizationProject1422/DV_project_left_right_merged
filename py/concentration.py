import pandas as pd
import os    
#year: 2013, index_categorie of Shaanxi Xi'an
index_cat = []
year = 2013
months = ['01','02','03','04','05','06','07','08','09','10','11','12']
days = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']
city = '西安市'
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
        for i in range(0,len(data)):
            if data['城市'][i] == city:
                # print(data[i:i+1])
                ft_file = pd.concat([ft_file,data[i:i+1]])
        # print(ft_file)
#                 # data=data.drop(index = [i],inplace = True)
# #         # print(data)
#         a = ft_file.loc[:,'指数类别'].value_counts()
#         b = a.idxmax()  
# #         # print(b)
        pm25= ft_file['PM2.5_IAQI'].mean()
        # print(pm25)
        pm10= ft_file['PM10_IAQI'].mean()
        so2= ft_file['SO2_IAQI'].mean()
        no2= ft_file['NO2_IAQI'].mean()
        co= ft_file['CO_IAQI'].mean()
        o3= ft_file['O3_IAQI'].mean()
        
        tot = pm25 + pm10 + so2 +no2 + co +o3
        
        output_line = pd.DataFrame({'Date':{0:int(file[30:38])},'Year':{0:file[30:34]},'Month':{0:file[34:36]},'Day':{0:file[36:38]},'PM25':{0:pm25},'PM10':{0:pm10},'SO2':{0:so2},'NO2':{0:no2},'CO':{0:co},'O3':{0:o3},'Total':{0:tot},'城市':{0:city}})
        # print(output_line)
#         # print(data['城市']) 
#         # print(data['AQI'])
#         # break
        output_month = pd.concat([output_month,output_line],ignore_index=True)
    pm25= output_month['PM25'].mean()
        # print(pm25)
    pm10= output_month['PM10'].mean()
    so2= output_month['SO2'].mean()
    no2= output_month['NO2'].mean()
    co= output_month['CO'].mean()
    o3= output_month['O3'].mean()
    tot = pm25 + pm10 + so2 +no2 + co +o3
        
    output_new = pd.DataFrame({'Month':{0:month},'PM25':{0:pm25},'PM10':{0:pm10},'SO2':{0:so2},'NO2':{0:no2},'CO':{0:co},'O3':{0:o3},'Total':{0:tot}})
    output = pd.concat([output,output_new],ignore_index=True)

print(output)
output = output.sort_values(by=["Month"] , ascending=True)
# # output = output.values.tolist()
output = output.reset_index(drop=True)
# print(output)
output.to_csv('../data/in_use/2013_Xian_all_concentration.csv')