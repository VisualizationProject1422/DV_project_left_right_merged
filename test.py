import matplotlib.pyplot as plt
import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_iris
import seaborn as sns; sns.set()
from sklearn.mixture import GaussianMixture as GMM

iris = load_iris()
X = iris.data[:, :]
#绘制数据分布图
plt.subplot(3,1,1)
plt.scatter(X[:, 0], X[:, 1], c = "red", marker='o', label='see')
plt.legend(loc=2)
estimator = KMeans(n_clusters=4)#构造聚类器
estimator.fit(X)#聚类
label_pred = estimator.labels_ #获取聚类标签

#绘制k-means结果
x0 = X[label_pred == 0]
x1 = X[label_pred == 1]
x2 = X[label_pred == 2]
x3 = X[label_pred == 3]
plt.subplot(3,1,2)
plt.scatter(x0[:, 0], x0[:, 1], c = "red", marker='o', label='label0')
plt.scatter(x1[:, 0], x1[:, 1], c = "green", marker='*', label='label1')
plt.scatter(x2[:, 0], x2[:, 1], c = "blue", marker='+', label='label2')
plt.scatter(x3[:, 0], x3[:, 1], c = "black", marker='x', label='label3')
plt.legend(loc=2)


gmm = GMM(n_components=4).fit(X) #指定聚类中心个数为4
labels = gmm.predict(X)
print(labels)
plt.subplot(3,1,3)
plt.scatter(X[:, 0], X[:, 1], c=labels, s=50, cmap='viridis')
plt.show()

# probs = gmm.predict_proba(X)
# size = probs.max(1)
# plt.figure(2)
# plt.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis', s=size)
# plt.show()

