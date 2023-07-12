Using stories and data sharing to empower people in the fight against antimicrobial resistance.

## main branch

Official release of the online website that it's hosted at https://spearhead-amr.github.io/makeaware/

^: merge dev into main

+: commit

main branch:   +-------+-----+

dev branch:  +-+-+-+-^-+-+-^

## dev branch

Used to develop the website. This branch has to be merged with the main branch to update the online website.


### dev environment

Mac OSx/Linux: run a simple local server via Terminal to see the website, and navigate to the folder of the project on your Mac:
```
$ cd /path/to/makeaware-folder
````

Windows: open the Command Prompt, and navigate to the folder of the project on your PC:

```
// if you need to change to a different drive
> D:
> cd path\to\makeaware-folder
```

In both cases, start a local HTTP server by running one of those commands:

```
// if running python 2.x
$ python -m SimpleHTTPServer
// if running python 3.x
$ python3 -m http.server
// or
$ python -m http.server
```
In your browser open the url http://localhost:8000/ to see the website.
