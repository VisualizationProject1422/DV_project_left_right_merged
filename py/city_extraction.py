import pandas as pd

# data.loc[line,'省份'], data.loc[line,'城市'] 

if __name__ == "__main__":  
    data = pd.read_csv('/Users/liushiyi/Desktop/2021-2022 SPRING/ARTS 1422 Data Visualization/project/project/data/daily_processed/201301/processed_CN-Reanalysis-daily-2013010100.csv')
    province = data['省份']
    # print(province)
    city = data['城市']
    new = pd.concat([province, city], axis=1)
    new.to_csv('./province_city.csv')
    