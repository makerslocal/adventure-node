# adventure-node
A nodejs web portal to play the classic Colossal Cave Adventure

I want to provide a web interface for the Adventure game that is as truthful as possible without going down the rabbit hole of emulating a PDP-10 and getting the original Fortran program...

This node server will provide a basic interface which will shuttle user input and program response between a webpage and a live copy of the 1993 C variant of Adventure, running on the host machine. This isn't a port, the user is actually playing the game installed by some form of "bsd-games" package for the distro.

# Methods

Right now I plan to have a single nodejs thread running the site, which will spawn a child nodejs server that then spawns and manages the game.