import json
import io
import os

infile = io.open('selected_user_info.json', encoding='utf-8')

out = {}

for line in infile:
    doc = json.loads(line)
    
    if doc is not None:

        if doc['id_str'] not in out:
            # make new entry
            #followers_count; friends_count; id_str; lang; time_zone;

            entry = {}        
            entry['id_str'] = doc["id_str"]
            entry['lang'] = [doc["lang"]]
            
            if doc["lang"] is not None:
                entry['lang'] = [doc["lang"]]
                entry['lang_count'] = 1
            else:
                entry['lang'] = []
                entry['lang_count'] = 0

            entry['followers_count'] = doc["followers_count"]
            entry['friends_count'] = doc["friends_count"]

            #put new entry into out file
            out[doc["id_str"]] = entry

        else:
            entry = out[doc["id_str"]]
            #print(entry)

            #append info
            if doc["lang"] not in entry["lang"]:
                entry['lang'].append(doc["lang"])
                entry["lang_count"] += 1  

                    
            #put updated entry into out file
            out[doc["id_str"]] = entry
            

# write out file

outfile = io.open("user_features.json", 'w', encoding='utf-8')

#print out
for l in out:
    print l
    nl = json.dumps(out[l])+'\n'
    nl = unicode(nl, "utf-8")
    outfile.write(nl)
