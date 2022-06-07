import csv
import math
import json
import re

from datetime import date, timedelta


i = 0
d = date(2013, 1, 1)

data = []
print(d.strftime('%Y%m%d00'))
# while i < 365*6+1:
#     with open('/Users/pengzzh/myproject/static/innerData/city_AQI_IAQI/day/'+d.strftime('%Y%m%d00')+'.csv', encoding="utf8") as f:
#         a1 = 0
#         a2 = 0
#         a3 = 0
#         a4 = 0
#         a5 = 0
#         a6 = 0
#         f_csv = csv.DictReader(f)
#         for row in f_csv:
#             aqi = float(row['AQI'])
#             if aqi > 300:
#                 a6 += 1
#             elif aqi > 200:
#                 a5 += 1
#             elif aqi > 150:
#                 a4 += 1
#             elif aqi > 100:
#                 a3 += 1
#             elif aqi > 50:
#                 a2 += 1
#             else:
#                 a1 += 1
#         da = d.strftime('%Y-%m-%d')
#         data.append([da,a1,'优'])
#         data.append([da,a2,'良'])
#         data.append([da,a3,'轻度污染'])
#         data.append([da,a4,'中度污染'])
#         data.append([da,a5,'重度污染'])
#         data.append([da,a6,'严重污染'])
#     d = d + timedelta(days=1)
#     i += 1


# with open ('/Users/pengzzh/myproject/static/innerData/theme.csv', 'w', encoding="utf8", newline = '') as f:
#     f_csv = csv.writer(f)
#     # f_csv.writerow({'type', 'value', 'date'})
#     for i in data:
#         f_csv.writerow(i)

while i < 365*6+1:
    with open('D:\迅雷下载\\'+d.strftime('%Y%m')+'\CN-Reanalysis-daily-'+d.strftime('%Y%m%d00')+'.csv', encoding="utf8") as f:
        tow = []
        f_csv = csv.DictReader(f)
        for row in f_csv:
            data = {}
            data['u'] = float(row[' U(m/s)'])
            data['v'] = float(row[' V(m/s)'])
            data['lat'] = float(row[' lat'])
            data['lon'] = float(row[' lon'])
            tow.append(data)
    with open(d.strftime('%Y%m%d')+'.json', 'w', encoding="utf8", newline='') as f:
        f.write(json.dumps(tow,ensure_ascii=False))
    d = d + timedelta(days=1)
    i += 1
    print(i)



