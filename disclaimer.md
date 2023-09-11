# What Is The Hive Nobel Prize System?
## The man behind it
The account @anobel was created and is owned by me, @achimmertens. I believe, that the Hive ecosphere has big advantages and is especially appropriate to help people in need. So I try to invent a system, that has trustworthy curators, trustworthy authors, and donors who efficiently finance the helpers.


## The Rules + The Criteria
The curators look for posts, that contain:
- Good written content from people helping other people or the environment
- Pictures, to prove that this post is real and not spam or fake.
- Not too low reputation score of the authors.
- ...

Anyone can be a curator. If you find posts, that match the criteria, mark them with a "!CHARY" in the comments. You can add a colon + a number from zero to ten, to weight this post. Example:

!CHARY:7

This is no guarantee that the author gets rewarded, but it appears in the results, which @anobel checks. Don't abuse this, or you will get listed on a blacklist.

A weekly report consolidates these posts and orders the winners (by rules, that the @achimmertens/@anobel defines).
All the Hive-money, that has been sent until then to @anobel, will be distributed among the winners.

The SQL code to find the posts is:
```
-- Suche die Posts, die exakt "!CHARY" beinhalten (egal ob im Hauptpost oder in den Kommentaren)
-- und sortiere sie nach Zeit
SELECT 
	author, root_title, last_update, url, body, total_vote_weight
FROM 
   Comments 
WHERE CONTAINS(body, '"!CHARY"')
   AND body LIKE '%!CHARY%' COLLATE Latin1_General_CS_AS
ORDER BY last_update DESC;
```

![image.png](https://files.peakd.com/file/peakd-hive/anobel/23vsmbzaM8PtfucVYFSj5gtesXtWAG7YkhtXvUDXQARn9A4DXULKTLimnMvdWnZDnXxgg.png)
*Workflow of the Nobelprize system*

# What you can do
If you want to support needy people and their helpers also, you can:

## Reblog this report
The more people are involved, the more we can reach. 

## Curation Trail
Follow @anobel in the curation trail: 
https://hive.vote/dash.php

There you upvote automatically everyone, who @anobel will upvote. With this, you give some upvotes to the people that do good things:


## Donate Hive to @anobel 
All the Hive money that anobel owns, will be distributed among the next winners. This promise can be proved by checking [@anobel's wallet](https://peakd.com/@anobel/wallet).

## Help other people and write about it
Do something good and talk about it. Write it honestly and don't be ashamed to talk about your help. Use the hashtag "charity" and post it in the community ["Charity"](https://peakd.com/c/hive-149312). 

## Subscribe to ["Charity"](https://peakd.com/c/hive-149312) and engage with others
Subscribe to this community, curate some content, and talk to the authors to engage them. It is very important, that bloggers get feedback. It motivates them to go on. In return, you get new friends and an overview, of what good things happen in this world. It is a big contrast to the rest of the news.


## Follow [@anobel](https://peakd.com/@anobel)
There you should get regular reports about the winners. This is at the moment under construction. The reports are generated manually at the moment, but I (@achimmertens) am working on that.

## Follow [@achimmertens](https://peakd.com/@achimmertens)
Yes, I am always happy, when someone reads and upvotes my work ;-)



See you with the next "Hive Nobel Prizes Rewards" Report,

Greetings, Anobel (alias Achim)










--- 


![image.png](https://files.peakd.com/file/peakd-hive/anobel/23t79QKG7fJh2yqmZXxqsnHUieWodfrg8Q7iypCaG3HVexRxVugD3gnKqvvWfuNUyLXiY.png)


![image.png](https://files.peakd.com/file/peakd-hive/anobel/23vsmbzaM8PtfucVYFSj5gtesXtWAG7YkhtXvUDXQARn9A4DXULKTLimnMvdWnZDnXxgg.png)
*Workflow of the Nobelprize system*


![image.png](https://files.peakd.com/file/peakd-hive/anobel/23tGVGGcMFppCQZggFSHaDkZpojPUSRBJzCh4C6y4xs3gU6Fdf3VtZtdzQ6tAgnTV2G1n.png)



Greetings, Anobel (alias Achim)