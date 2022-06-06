import pandas as pd
import os
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn import decomposition
from sklearn.manifold import MDS, TSNE

import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import load_iris
import seaborn as sns; sns.set()
from sklearn.mixture import GaussianMixture as GMM

# rank & stack
def choose_extraction(layer_time, layer_geo, choose_time, choose_geo):
    for i in range(len(choose_time)):        
        filePath = f'static/innerData/{layer_geo}_AQI_IAQI/{layer_time}/{choose_time[i]}.csv'
        once_time_data = pd.read_csv(filePath)
        # print(once_time_data.index)
        # print(layer_geo)
        once_time_data = once_time_data[once_time_data[layer_geo].isin(choose_geo)]
        # print(once_time_data)
        if i == 0:
            res_data = once_time_data
        else:
            # res_data = res_data.add(once_time_data)
            res_data.loc[:, 'AQI':'O3_IAQI'] = res_data.loc[:, 'AQI':'O3_IAQI'].add(once_time_data.loc[:, 'AQI':'O3_IAQI'])
        # print(res_data)
    res_data.loc[:, 'AQI':'O3_IAQI'] /= len(choose_time)
    res_data.sort_values(by='AQI', inplace=True, ascending=False)
    # print(res_data)
    res_data = res_data.to_dict(orient='records')
    # print(res_data)
    return res_data


# scatter
def check_df_city_chinese(df_city):
    df_city_bool = []
    for city in df_city:
        if type(city) != str:
            df_city_bool.append(False)
        else:
            flag = True
            for letter in city:
                if letter < '\u4e00' or letter > '\u9fff':
                    flag = False
                    break
            df_city_bool.append(flag)
    return df_city_bool

def city_df_clean(city_df):
    city_df = city_df[ check_df_city_chinese(city_df['city']) ]
    city_df = city_df.reset_index().drop(['index'], axis=1)
    return city_df

def attach_label(layer_time, choose_time, choose_time_data):
    if layer_time == 'year':
        return
    elif layer_time == 'month':
        year = choose_time[0][0:4]
        year_first_month = f'{year}01.csv'
        # print(year_first_month)
        filePath = f'static/innerData/city_AQI_IAQI/month'
        choose_months_list = os.listdir(filePath)
        first_index = choose_months_list.index(year_first_month)

        for index in range(first_index, first_index+12):
            monthPath = f'static/innerData/city_AQI_IAQI/month/{choose_months_list[index]}'
            # print(monthPath)
            month_data = pd.read_csv(monthPath)
            month_data = city_df_clean(month_data)
            # print(month_data)
            month_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'] = month_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'].div(month_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'].sum(axis=1), axis=0)
            if index == first_index:
                year_data = pd.DataFrame(data=None, columns=month_data.columns)
            year_data = year_data.append(month_data, ignore_index=True)
        year_data.sort_values(by='city',ascending=True, inplace=True, ignore_index=True)
        # print(year_data)

        for i in range(len(month_data)):
            group = year_data.iloc[i*12:i*12+12,:]
            group = group.reset_index().drop(['index'], axis=1)
            # print(group)
            IAQI_mean = group.loc[:, 'PM2.5_IAQI':'O3_IAQI'].mean(axis=0)
            IAQI_std = group.loc[:, 'PM2.5_IAQI':'O3_IAQI'].std(axis=0)
            group_IAQI_describe = pd.DataFrame(data=[IAQI_mean, IAQI_std], index=['IAQI_mean', 'IAQI_std'])
            group_IAQI_describe.insert(0,'city', group.loc[0,'city'])
            # print(group_IAQI_describe)
            if i == 0:
                IAQI_describe = pd.DataFrame(data=None, columns=group_IAQI_describe.columns)                
            IAQI_describe = IAQI_describe.append(group_IAQI_describe)
        # print(IAQI_describe)
        # 求所求时间段的百分比成分谱
        choose_time_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'] = choose_time_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'].div(choose_time_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'].sum(axis=1), axis=0)
        # print(choose_time_data)

        choose_time_data['label'] = None
        for i, row in choose_time_data.iterrows():
            IAQI_flag = [ False for i in range(6) ]
            buffer = IAQI_describe.loc[IAQI_describe['city'] == row['city']]
            # print(buffer)
            for j in range(1, 7):
                choose_time_data.iloc[i, j]
                if choose_time_data.iloc[i, j] > (buffer.iloc[0, j] + buffer.iloc[1, j]):
                    IAQI_flag[j-1] = True
            # print(IAQI_flag)
            
            # 给每个地方 打标签 是什么污染类型
            # [PM2.5 PM10 SO2 NO2 CO O3]
            if True not in IAQI_flag:
                choose_time_data.loc[i, 'label'] = '标准型'
            elif IAQI_flag[2] and IAQI_flag[3] and IAQI_flag[4]:
                choose_time_data.loc[i, 'label'] = '偏工业型'
            elif IAQI_flag[0] and IAQI_flag[2]:
                choose_time_data.loc[i, 'label'] = '偏烟花型'
            elif IAQI_flag[3] and IAQI_flag[4]:
                choose_time_data.loc[i, 'label'] = '偏交通型'
            elif IAQI_flag[1]:
                choose_time_data.loc[i, 'label'] = '偏沙尘型'
            elif IAQI_flag[2]:
                choose_time_data.loc[i, 'label'] = '偏燃煤型'
            elif IAQI_flag[0]:
                choose_time_data.loc[i, 'label'] = '偏二次型'
            else:
                choose_time_data.loc[i, 'label'] = '其他型'
        # print(choose_time_data)
        return choose_time_data
    elif layer_time == 'day':
        return


def all_layer_scatter(layer_time, choose_time):
    # 先算choosetime的平均值
    for i in range(len(choose_time)):
        filePath = f'static/innerData/city_AQI_IAQI/{layer_time}/{choose_time[i]}.csv'
        once_time_data = pd.read_csv(filePath)
        once_time_data = city_df_clean(once_time_data)
        # print(once_time_data)
        if i == 0:
            choose_time_data = once_time_data
        else:
            choose_time_data.loc[:, 'AQI':'O3_IAQI'] = choose_time_data.loc[:, 'AQI':'O3_IAQI'].add(once_time_data.loc[:, 'AQI':'O3_IAQI'])
    choose_time_data.loc[:, 'AQI':'O3_IAQI'] /= len(choose_time)
    # print(choose_time_data)
    choose_time_data = choose_time_data.drop(['AQI'], axis=1)
    print(choose_time_data)
    # 加label
    buffer = attach_label(layer_time, choose_time, choose_time_data.copy())
    print(buffer)

    # 先做一个tsne降维
    labels = buffer['label']
    city_col = choose_time_data['city']
    choose_time_data = choose_time_data.drop(['city'], axis=1)
    print(choose_time_data)
    standard_choose_data = StandardScaler().fit_transform(choose_time_data)
    # TSNE perplexity = 30, n_iter = 1000
    tsne_30_1000 = TSNE(n_components=2, random_state=0, perplexity=50, n_iter=5000)
    tsne_choose_data = tsne_30_1000.fit_transform(standard_choose_data)
    tsne_choose_data = np.vstack( (tsne_choose_data.T, labels) ).T
    tsne_choose_data_df = pd.DataFrame(data=tsne_choose_data, columns=('x', 'y', 'labels'))
    # print(tsne_choose_data_df)
    tsne_choose_data_df['city'] = city_col
    # print(tsne_choose_data_df)

    X = tsne_choose_data_df.loc[:, 'x':'y']
    # print(X)
    X = X.values
    # print(X)

    gmm = GMM(n_components=8).fit(X) #指定聚类中心个数为4
    labels = gmm.predict(X)
    print(labels, len(labels))
    tsne_choose_data_df['label'] = labels
    # print(labels)
    # plt.scatter(X[:, 0], X[:, 1], c=labels, s=50, cmap='viridis')
    # plt.show()
    print(tsne_choose_data_df)
    tsne_choose_data_dict = tsne_choose_data_df.to_dict(orient='records')
    return tsne_choose_data_dict




layer_time = 'month'
layer_geo = 'province'
choose_time = ['201407', '201408']
choose_geo = ['浙江省', '海南省', '陕西省']
all_layer_scatter(layer_time, choose_time)


# print(len(seven_division))
# aqi_sum = 0
# for i in range(1, 13):
#     i = str(i).zfill(2)
#     filePath = f'static/innerData/province_AQI_IAQI/month/2016{i}.csv'
#     # print(filePath)
#     month_data = pd.read_csv(filePath)
#     month_aqi = month_data['AQI'][0]
#     print(month_aqi)
#     aqi_sum += month_aqi
# aqi_avg = aqi_sum/12
# print(aqi_avg)

# month_data1 = pd.read_csv('static/innerData/city_AQI_IAQI/year/2013.csv')
# print(month_data1[ check_df_city_chinese(month_data1['city']) ])
# print(month_data1[ check_chinese(month_data1) ])
# month_data2 = pd.read_csv('static/innerData/province_AQI_IAQI/month/201302.csv')
# year_data = pd.DataFrame(data=None, columns=month_data1.columns)
# print(year_data)
# hainan1 = month_data1.loc[0,:]
# hainan2 = month_data2.loc[0,:]
# year_data = year_data.append(hainan1, ignore_index=True)
# year_data = year_data.append(hainan2, ignore_index=True)
# print(year_data)




