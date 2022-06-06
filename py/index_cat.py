import pandas as pd
import numpy as np
import os    
#year: 2013, index_categorie of Shaanxi Xi'an
# year = 2013
months = ['01','02','03','04','05','06','07','08','09','10','11','12']
days = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']

cities_df=pd.read_csv('py/china_city_list.csv',header=0,usecols=['City_Admaster'],encoding='gbk')
cities = cities_df[['City_Admaster']].to_numpy()
cities= np.squeeze(cities)

print(cities)

for year in range(2013,2019):
    for city in cities:
    
        index_cat = []
        output = pd.DataFrame()
        #data reading region
        for month in months:
            path = '../data/daily_processed/'+str(year)+month
            files= os.listdir(path)
            # print(files)
            for file in files:
                # print(file)
                data=pd.read_csv('../data/daily_processed/'+str(year)+month+'/'+file,header=0, sep=',',usecols=['指数类别','城市'])
                # print(type(data))
                # print(data)
                ft_file = pd.DataFrame()
                flag = 0
                for i in range(0,len(data)):
                    if data['城市'][i] == city:
                        # print(data[i:i+1])
                        flag = 1
                        ft_file = pd.concat([ft_file,data[i:i+1]])
                # print(ft_file)
                        # data=data.drop(index = [i],inplace = True)
                # print(data)
                if flag ==1:
                    # print(city)
                    a = ft_file.loc[:,'指数类别'].value_counts()
                    b = a.idxmax()  
                    # print(b)
                    output_line = pd.DataFrame({'Date':{0:int(file[30:38])},'Year':{0:file[30:34]},'Month':{0:file[34:36]},'Day':{0:file[36:38]},'指数级别':{0:b}})
                    # print(output_line)
                    # print(data['城市']) 
                    # print(data['AQI'])
                    # break
                    output = pd.concat([output,output_line],ignore_index=True)
        if flag==1:
            output = output.sort_values(by=["Date"] , ascending=True)
            # output = output.values.tolist()
            output = output.reset_index(drop=True)
            output = pd.DataFrame(output)
            print(output)
            output.to_csv('static/data/'+str(year)+'/calendar/year/'+city+'.csv')