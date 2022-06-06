import pandas as pd
import os    
import math
import json
import numpy as np

def default_dump(obj):
    """Convert numpy classes to JSON serializable objects."""
    if isinstance(obj, (np.integer, np.floating, np.bool_)):
        return obj.item()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj
    
#year: 2013, index_categorie of Shaanxi Xi"an
index_cat = []
year = 2013
months = ["01","02","03","04","05","06","07","08","09","10","11","12"]
# months = ["01"]
days = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]
city = "西安市"

cities_df=pd.read_csv('py/china_city_list.csv',header=0,usecols=['City_Admaster'],encoding='gbk')
cities = cities_df[['City_Admaster']].to_numpy()
cities= np.squeeze(cities)

print(cities)

# for year in range(2013,2019):
#     for city in cities:
ft_file = pd.DataFrame()
#data reading region
for month in months:
    path = "../data/daily_processed/"+str(year)+month
    files= os.listdir(path)
    # print(files)
    for file in files:
        # print(file)
        data=pd.read_csv("../data/daily_processed/"+str(year)+month+"/"+file,header=0, sep=",",usecols=["PM2.5_IAQI","PM10_IAQI","SO2_IAQI","NO2_IAQI","CO_IAQI","O3_IAQI","AQI","指数类别","城市"," U(m/s)"," V(m/s)","首要污染物"])
        # print(type(data))
        # print(data)
        flag =0 
        for i in range(0,len(data)):
            if data["城市"][i] == city:
                flag =1
                # print(data[i:i+1])
                data.loc[i, "month"]=month
                ft_file = pd.concat([ft_file,data[i:i+1]])

                # break
        # break
    if flag ==1:
        ft_file=ft_file.reset_index(drop=True)
        # print(ft_file[" V(m/s)"][i])
        # print(ft_file)
        for i in range(0,len(ft_file)):
            ft_file.loc[i, "degree"] = math.atan(abs(ft_file[" U(m/s)"][i]/ft_file[" V(m/s)"][i]))/math.pi*180
            # print(ft_file.loc[i, "degree"])
            if ft_file["degree"][i]>=67.5:
                if ft_file[" V(m/s)"][i]>0:
                    ft_file.loc[i, "direction"] = "东风"
                else:
                    ft_file.loc[i, "direction"] = "西风"
            elif ft_file["degree"][i]<22.5:   
                if ft_file[" U(m/s)"][i]>0:
                    ft_file.loc[i, "direction"] = "南风"
                else:
                    ft_file.loc[i, "direction"] = "北风"
            elif (ft_file[" U(m/s)"][i]>0) & (ft_file[" V(m/s)"][i]>0):
                ft_file.loc[i, "direction"] = "东南风"
            elif (ft_file[" U(m/s)"][i]<0) & (ft_file[" V(m/s)"][i]>0):
                ft_file.loc[i, "direction"] = "东北风"
            elif (ft_file[" U(m/s)"][i]>0) & (ft_file[" V(m/s)"][i]<0):
                ft_file.loc[i, "direction"] = "西南风"
            elif (ft_file[" U(m/s)"][i]<0) & (ft_file[" V(m/s)"][i]<0):
                ft_file.loc[i, "direction"] = "西北风"
        # print(ft_file)
            # ft_file.loc[line, "AQI"] = max
        counts_dir = ft_file.loc[:,"direction"].value_counts()
        print(counts_dir)
        south_all = pd.DataFrame()
        north_all = pd.DataFrame()
        west_all = pd.DataFrame()
        east_all = pd.DataFrame()
        for i in range(0,len(ft_file)):
            if ft_file["direction"][i] == "南风":
                south_all = pd.concat([south_all,ft_file[i:i+1]])
            if ft_file["direction"][i] == "北风":
                north_all = pd.concat([north_all,ft_file[i:i+1]])
            if ft_file["direction"][i] == "东风":
                east_all = pd.concat([east_all,ft_file[i:i+1]])
            if ft_file["direction"][i] == "西风":
                west_all = pd.concat([west_all,ft_file[i:i+1]])
                
        southeast_all = pd.DataFrame()
        northwest_all = pd.DataFrame()
        southwest_all = pd.DataFrame()
        northeast_all = pd.DataFrame()
        for i in range(0,len(ft_file)):
            if ft_file["direction"][i] == "东南风":
                southeast_all = pd.concat([southeast_all,ft_file[i:i+1]])
            if ft_file["direction"][i] == "西北风":
                northwest_all = pd.concat([northwest_all,ft_file[i:i+1]])
            if ft_file["direction"][i] == "西南风":
                southwest_all = pd.concat([southwest_all,ft_file[i:i+1]])
            if ft_file["direction"][i] == "东北风":
                northeast_all = pd.concat([northeast_all,ft_file[i:i+1]])
                
        # print(south_all)
        counts_south = south_all.loc[:,"指数类别"].value_counts()
        counts_north = north_all.loc[:,"指数类别"].value_counts()
        counts_west = west_all.loc[:,"指数类别"].value_counts()
        counts_east = east_all.loc[:,"指数类别"].value_counts()
        counts_southeast = southeast_all.loc[:,"指数类别"].value_counts()
        counts_southwest = southwest_all.loc[:,"指数类别"].value_counts()
        counts_northeast = northeast_all.loc[:,"指数类别"].value_counts()
        counts_northwest = northwest_all.loc[:,"指数类别"].value_counts()

        # print(counts_south["优"])

        # output = {"south":{"指数类型","size"},"north":{"指数类型","size"}}
        output_dir = []
        direction_array = ["南风","西南风","西风","西北风","北风","东北风","东风","东南风"]
        array_all = [south_all, southwest_all, west_all, northwest_all, north_all, northeast_all, east_all, southeast_all]
        array = [counts_south, counts_southwest, counts_west, counts_northwest, counts_north, counts_northeast, counts_east, counts_southeast]
        # index_array = [""]


        types = ["优","良","轻度污染","中度污染","重度污染","严重污染"]
        output_direction = []
        # for direction in direction_array:
        # for drt in array:
        for i in range(0,8):
            output_dir = []
            types = array[i].keys()
            for type1 in types:
                output_type ={"name": type1,"size": array[i][type1]}
                # print('tyooooooo',output_type)
                output_dir.append(output_type)
            # print(output_dir)
            # print(output_dir)
            one_dir = {"name":direction_array[i], "children":output_dir}
            # print(one_dir)
            output_direction.append(one_dir)
        # print(output_direction)
        output = {"name":" ","children":output_direction}
            
        # print(output_direction)
        # output_direction = dict(output_direction)
        # print(type(output_direction))
        # print(output)
        # json_str = json.dumps(output, ensure_ascii=False) 
        # with open("static/in_use/2013_sunburst.json","w") as f:
        #     f.write(output)

        print(json.dumps(output, ensure_ascii=False, default=default_dump), file=open("static/data/"+str(year)+"/sunburst/year/"+city+".json","w+"))

# print(output, type(output))
# array = [south_all, north_all, west_all, east_all, southeast_all, northwest_all, southwest_all, northeast_all]
# for a in array:
    
    
    

# output = ft_file.sort_values(by=["Month"] , ascending=True)
# # output = output.values.tolist()
# output = ft_file.reset_index(drop=True)
# print(output)
# ft_file.to_csv("static/in_use/2013_Xian_sunburst.csv")