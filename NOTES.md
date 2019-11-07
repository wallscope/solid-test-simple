Notes on building a SOLID project
=================================

Below I'll list my experiences of using the React SDK to build an example application that interacts with a solid pod. I am aware these things are quite new and there is work being made on it, so I hope any criticism is taken in a constructive way because that is how it is meant.

I worked on the App for 3 work days and my background is as a Full Stack Developer with about 4 years experience. I had used react before but about 3 years ago, so my 1st day was pretty much spent just understanding how React has changed and getting my head around hooks and stuff.

Here goes...

The example app is very complex and there is a huge gap between the TicTacToe and the skeleton examples. I feel like there should be an example somewhere in the middle.
A lot of the things that are done in the TicTacToe example don't seem to be documented, so I spent a lot of time having to read code to understand it, in an Ideal World™ I would have gotten it by simply looking at documentation.

The shapes file is a very cool idea but it might have been more helpful if the shapes were consistent. As in, same fields with the same type of values.

It seems like there's a lot of stuff that is specific to the TicTacToe example even in the skeleton app, which would have been confusing if I didn't spend time looking at the TicTacToe example. Example: the APP_PATH variable is called TICTACTOE, the inbox that is created by default is called 'game' and there are a lot of references to 'game' in the translation files. 

It was good to have access to all the utils but it would have been good to have a few working examples of how to use them.

Something about LDFlex (which has been raised on github already, can't remember the issue #), it is unclear how to make concurrent requests using the Proxy system. Ruben seems to have a solution implementing a .all() method, don't know where that is on the road map but as far as I'm concerned, it would have helped a lot, it really hurt the performance to not have an example that shows concurrent access to different properties in a resource on a pod. Full disclaimer, I only spent 3 days on this, that info might be out there somewhere.

Non react related. It would be cool to have some sort of app that gives a lot more fine grained control over a pod for development purposes. While I was still developing the data model I created a few entries that were not like the final model, which means that I had a few corrupted entries in my application that I just couldn't get rid of.

ACL? It would be useful to have a few examples of the ACL system that explain how to code it and what the code is doing. I ended up just copying the ACL stuff from the TicTacToe example and don't really understand it even now. It works tho... `¯\_(ツ)_/¯`

Are there any plans to implement a SPARQL or SPARQL like interface to a pod? One of the most powerful things for me in linked data was always how expressive SPARQL is, so it seems like my application would have been a LOT simpler if I could have just sent SPARQL queries to a pod.

Final question: What is the best way to communicate with someone technical as a partner company, rather than going through the Solid gitter, where I 1) can't share client information, 2) might have my questions diluted in the noise and can't really afford that with the time pressures.
