import json
import io
import os

infile = io.open('main_data.json', encoding='utf-8')

countryList = {}

for line in infile:
    fullJson = json.loads(line)

    if fullJson is not None:
        tweetJsons = fullJson["tweets"]
        
        for tweetJson in tweetJsons:
           
            if tweetJson['u_id'] not in countryList:
                #make new entry with id and list of countries visited

                entry = {}
                tweetJson["cntry"] = set()
                entry['u_id'] = tweetJson["u_id"]

                if tweetJson["cntry"] is not None:
                    entry['cntry'] = tweetJson["cntry"]

                countryList[tweetJson["u_id"]] = entry

            else:
                # update the country list
                entry = countryList[tweetJson["u_id"]]
                if tweetJson['cntry'] not in entry["cntry"]:
                    entry['cntry'].add(tweetJson["cntry"])
                countryList[tweetJson['u_id']] = entry
            
# write out file

outfile = io.open("user_countries.json", 'w', encoding='utf-8')

#print out
for l in countryList:
    countryList[l]['cntry'] = list(countryList[l]['cntry'])
    countryList[l]['cntryCount'] = len(countryList[l]['cntry'])
    outfile.write(unicode(json.dumps(countryList[l])))
    outfile.write(unicode('\n'))
