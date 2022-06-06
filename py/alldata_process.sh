#!/bin/bash

daily_data_path="../data/daily/"
output_daily_data_path="../data/daily_processed/"

daily_data_dir=$(ls $daily_data_path)
for pathname in $daily_data_dir
do  
    echo $pathname
    daily_data_file=$(ls $daily_data_path$pathname/)
    # echo "working dir: "$daily_data_file
    for filename in $daily_data_file
    do
        filename=${filename##*/}
        echo "working file: "$daily_data_path$pathname/$filename

        dir=$output_daily_data_path
        dir_w=$dir$pathname
        if [ ! -d "$dir_w" ];then
        mkdir $dir
         mkdir $dir$pathname
        echo "make dir successfully "$dir$pathname
        else
        echo "dir already "
        fi

        python3 data_process_new.py $daily_data_path$pathname/$filename $output_daily_data_path$pathname/processed_$filename
    done
done