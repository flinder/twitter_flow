# Load the two user feature files and the country coded twitter file and produce
# a final json file that will be loaded by the application. See google docs for
# the exact description


from __future__ import unicode_literals, division
import io
import json
import sys
from pprint import pprint

def process_user1(doc):
    d = {}
    d['u_id'] = doc['user_id']
    d['n_tweet_lang'] = len(doc['languages'])
    d['n_tweets'] = doc['n_tweets']
    d['voc'] = doc['vocab_size'] / doc['n_tweets']
    users[d['u_id']] = d

def process_user2(doc):
    d = users[doc['id_str']]
    d['n_prof_lang'] = doc['lang_count']
    d['prof_lang'] = doc['lang'][0]
    d['n_follow'] = doc['followers_count']
    d['n_friends'] = doc['friends_count']

def process_tweet(doc):
    d = {}
    d['t_id'] = doc['tweet_id']
    d['u_id'] = doc['user_id']
    d['time'] = doc['time_v2']
    d['coord'] = doc['coordinates']
    d['cntry'] = doc['country_abbr']
    tweets.append(d)
    
def process_country(doc):
    d = users[doc['u_id']]
    d['cntryCount'] = doc['cntryCount']
    d['cntries'] = doc['cntry']
    
def process_file(FILE, process): 
    with io.open(FILE, 'r', encoding='utf-8') as infile:
        for i,line in enumerate(infile):
            doc = json.loads(line)
            process(doc)
            
if __name__ == '__main__':
 
    TWEETFILE = '../data/countries_alluser_to.txt'
    FEATUREFILE_1 = '../data/user_tweet_features.json'
    FEATUREFILE_2 = '../data/user_features.json'
    CNTRYFILE = '../data/user_countries.json'
    OUTFILE = '../data/main_data.json'
    OUTFILE_SAMPLE = '../data/main_data_sample.json'

    # Generate the user and tweet dictionaries
    users = {}
    tweets = []

    process_file(TWEETFILE, process_tweet)
    process_file(FEATUREFILE_1, process_user1)
    process_file(FEATUREFILE_2, process_user2)
    process_file(CNTRYFILE, process_country)

    users_list = [users[u] for u in users]

    out_obj = {'users': users_list,
               'tweets': tweets}

    with io.open(OUTFILE, 'w', encoding='ascii') as outfile:
        outfile.write(unicode(json.dumps(out_obj)))


    # Generate a sample for development
    selected_ids = set()
    selected_users = []
    selected_tweets = []

    for i,user in enumerate(users_list):
        selected_ids.update([user['u_id']])
        selected_users.append(user)
        if i == 99:
            break

    for i,tweet in enumerate(tweets):
        if tweet['u_id'] in selected_ids:
            print tweet['u_id']
            selected_tweets.append(tweet)
        if i % 10000 == 0:
            print i
    
    samp_out = {'users': selected_users,
                'tweets': selected_tweets}

    print len(selected_users)
    print len(selected_tweets)

    with io.open(OUTFILE_SAMPLE, 'w', encoding='ascii') as outfile:
        outfile.write(unicode(json.dumps(samp_out)))


