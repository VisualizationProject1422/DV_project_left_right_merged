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
        once_time_data = once_time_data[once_time_data[layer_geo].isin(choose_geo)]
        if i == 0:
            res_data = once_time_data
        else:
            res_data.loc[:, 'AQI':'O3_IAQI'] = res_data.loc[:, 'AQI':'O3_IAQI'].add(once_time_data.loc[:, 'AQI':'O3_IAQI'])
    res_data.loc[:, 'AQI':'O3_IAQI'] /= len(choose_time)
    res_data.sort_values(by='AQI', inplace=True, ascending=True)
    res_data = res_data.to_dict(orient='records')
    return res_data


# scatter
def check_df_obj_chinese(df_obj):
    df_obj_bool = []
    for obj in df_obj:
        if type(obj) != str:
            df_obj_bool.append(False)
        else:
            flag = True
            for letter in obj:
                if letter < '\u4e00' or letter > '\u9fff':
                    flag = False
                    break
            df_obj_bool.append(flag)
    return df_obj_bool

def obj_df_clean(obj_df, obj):
    obj_df = obj_df[ check_df_obj_chinese(obj_df[obj]) ]
    obj_df = obj_df.reset_index().drop(['index'], axis=1)
    return obj_df

def attach_label(layer_time, choose_time, choose_time_data, obj):
    if layer_time == 'year':
        return
    elif layer_time == 'month':
        year = choose_time[0][0:4]
        year_first_month = f'{year}01.csv'
        # print(year_first_month)
        filePath = f'static/innerData/obj_AQI_IAQI/month'
        choose_months_list = os.listdir(filePath)
        first_index = choose_months_list.index(year_first_month)

        for index in range(first_index, first_index+12):
            monthPath = f'static/innerData/obj_AQI_IAQI/month/{choose_months_list[index]}'
            # print(monthPath)
            month_data = pd.read_csv(monthPath)
            month_data = obj_df_clean(month_data, obj)
            # print(month_data)
            month_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'] = month_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'].div(month_data.loc[:, 'PM2.5_IAQI':'O3_IAQI'].sum(axis=1), axis=0)
            if index == first_index:
                year_data = pd.DataFrame(data=None, columns=month_data.columns)
            year_data = year_data.append(month_data, ignore_index=True)
        year_data.sort_values(by=obj,ascending=True, inplace=True, ignore_index=True)
        # print(year_data)

        for i in range(len(month_data)):
            group = year_data.iloc[i*12:i*12+12,:]
            group = group.reset_index().drop(['index'], axis=1)
            # print(group)
            IAQI_mean = group.loc[:, 'PM2.5_IAQI':'O3_IAQI'].mean(axis=0)
            IAQI_std = group.loc[:, 'PM2.5_IAQI':'O3_IAQI'].std(axis=0)
            group_IAQI_describe = pd.DataFrame(data=[IAQI_mean, IAQI_std], index=['IAQI_mean', 'IAQI_std'])
            group_IAQI_describe.insert(0,obj, group.loc[0,obj])
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
            buffer = IAQI_describe.loc[IAQI_describe[obj] == row[obj]]
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


def all_layer_scatter(layer_time, choose_time, obj):
    # 先算choosetime的平均值
    for i in range(len(choose_time)):
        filePath = f'static/innerData/{obj}_AQI_IAQI/{layer_time}/{choose_time[i]}.csv'
        once_time_data = pd.read_csv(filePath)
        once_time_data = obj_df_clean(once_time_data, obj)
        if i == 0:
            choose_time_data = once_time_data
        else:
            choose_time_data.loc[:, 'AQI':'O3_IAQI'] = choose_time_data.loc[:, 'AQI':'O3_IAQI'].add(once_time_data.loc[:, 'AQI':'O3_IAQI'])
    choose_time_data.loc[:, 'AQI':'O3_IAQI'] /= len(choose_time)
    AQI_col = choose_time_data['AQI']
    choose_time_data = choose_time_data.drop(['AQI'], axis=1)
    print(choose_time_data)
    
    # 加label
    # buffer = attach_label(layer_time, choose_time, choose_time_data.copy())
    # print(buffer)

    # 先做一个tsne降维
    # hand_label = buffer['label']
    obj_col = choose_time_data[obj]
    choose_time_data = choose_time_data.drop([obj], axis=1)
    standard_choose_data = StandardScaler().fit_transform(choose_time_data)
    # TSNE perplexity = 30, n_iter = 1000
    tsne_30_1000 = TSNE(n_components=2, random_state=0, perplexity=50, n_iter=5000)
    tsne_choose_data = tsne_30_1000.fit_transform(standard_choose_data)
    tsne_choose_data = np.vstack( (tsne_choose_data.T) ).T
    tsne_choose_data_df = pd.DataFrame(data=tsne_choose_data, columns=('x', 'y'))
    tsne_choose_data_df[obj] = obj_col
    tsne_choose_data_df['AQI'] = AQI_col

    # 做pca
    

    # 再做一个gmm
    X = tsne_choose_data_df.loc[:, 'x':'y']
    X = X.values
    gmm = GMM(n_components=8).fit(X) #指定聚类中心个数为8
    gmm_label = gmm.predict(X)
    # print(gmm_label, len(gmm_label))
    tsne_choose_data_df['gmm_label'] = gmm_label
    # print(gmm_label)
    # plt.scatter(X[:, 0], X[:, 1], c=gmm_label, s=50, cmap='viridis')
    # plt.show()
    # print(tsne_choose_data_df)
    # print(choose_time_data)
    # print(tsne_choose_data_df)
    tsne_choose_data_df = pd.concat([tsne_choose_data_df, choose_time_data], axis=1)
    # print(tsne_choose_data_df)
    tsne_choose_data_dict = tsne_choose_data_df.to_dict(orient='records')
    return tsne_choose_data_dict

# layer_time = 'year'
# layer_geo = 'province'
# choose_time = ['2013']
# choose_geo = ['浙江省', '海南省', '陕西省']
# all_layer_scatter(layer_time, choose_time, 'province')
