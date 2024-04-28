# text-layout

Wrap styled runs of text at a given width, or fit them to a given size

## todo

### motivation etc

Explain that this was designed for my own use cases, so doesn't cover all
aspects of text layout, explain what it does and does not do, with a note that 
I'm happy to consider adding other use cases and/or accepting PRs to do so

### license

Add font licenses for Google fonts used in integration testing

### generating runs

Consider filtering out empty runs eg text: '', width: 0 etc - having them
there is slightly faster to produce the runs initially but may slow down 
processing slightly

### types

Consider using the T extends U pattern, so users can eg decorate their types 
with additional data which is retained when objects are decorated/extended by
our module - maybe not necessary and would be less performant

### draw

drawRunAligned should probably be drawLineAligned, makes more sense to do the
whole line at once as only lines are affected by alignment

In that vein, we should probably have a draw for each type, run, word, line etc

### fit

We now have a working fit algo, in shfitty.ts

Needs to be tidied up a bit, but it works.

It also needs to handle the case where one or more words are too wide to be 
wrapped, easy, you just find the ratio between the widest word and the maxWidth 
and scale by that

Once that's done it can be moved from ./test/ to ./src/ and renamed from 
shfitty.ts to just 'fit'

There is an additional optimization that can be made:

We can start with an initial scale that's closer to the correct one which 
will reduce the number of iterations needed to find the correct scale, by eg
setting it to the ratio of the areas of the existing text and the target size

Also, consider doing what we did with scaling and intend to do with drawing -
make a fit for runs, words, lines etc - enables eg that effect where each line 
is scaled indepently to fit the same width to produce a block of text, often
seen on posters, book covers etc

Some other fit libs also have an option
to ignore height and only scale for width, consider this too

### blocks etc

Also consider options for the following:

Adjusting the Line width if actualBoundingBoxLeft and actualBoundingBoxRight are 
available - we only need to check the first word and last word on a Line

Adjusting the Block height if actualBoundingBoxAscent and 
actualBoundingBoxDescent are available - we only need to check the first Line
and last Line in a Block

If those metrics are available, consider having an offsetX and offsetY on a 
Block to reflect this, eg so you can draw text flush inside a rectangle

### tests

Once these are done, expand the test suite to cover more cases

We should probably have unit test for some of the code, but as it's graphical
in nature integration tests like we currently use are probably more useful
overall

We could actually run eg a headless browser, convert the runs to styled spans,
and compare how it wraps etc - but all text layout engines have minor 
differences so it may be difficult and doesn't prove much

#### test edge cases

Very small or very large text. Very short or very long words. Small amounts or
large amounts of text. Fitting to very small or very large bounds/width etc.

### documentation

Expand the documentation 

Consider a note that you can use a font module like eg opentype to measure the
metrics without using eg a canvas getMetrics implementation

### examples

Add examples for both node (via @napi-rs/canvas) and browser (via canvas)

### Finalize

Publish the module to NPM

## Refactoring results

Compare results of moving from wrapping the text from scratch every time, to 
splitting them up into hard and soft wrapping and only performing the soft 
wrapping step when scale changes

prev:

```
fit took (ms): 7.7418
rough fit took (ms): 6.7113
shfitty
{ lowerBound: 1, upperBound: 2 }
{ iterations: 9 }
shfitty sh1x took (ms): 44.8203
{ closeFitScale: 1.1103515625 }
{ lowerBound: 0.5, upperBound: 1 }
{ iterations: 9 }
shfitty sh2x took (ms): 33.1616
{ closeFitScale: 0.55517578125 }
{ lowerBound: 0.0625, upperBound: 1 }
{ iterations: 9 }
shfitty sh10x took (ms): 51.6296
{ closeFitScale: 0.11102294921875 }
{ lowerBound: 1, upperBound: 16 }
{ iterations: 8 }
shfitty sh0_1x took (ms): 50.0956
{ closeFitScale: 11.107421875 }
{ lowerBound: 1, upperBound: 4 }
{ iterations: 9 }
shfitty sh0_5x took (ms): 42.8091
{ closeFitScale: 2.2216796875 }
```

after:
```
shfitty
{ lowerBound: 1, upperBound: 2 }
{ iterations: 9 }
shfitty sh1x took (ms): 3.4538
{ closeFitScale: 1.1103515625 }
{ lowerBound: 0.5, upperBound: 1 }
{ iterations: 9 }
shfitty sh2x took (ms): 2.4577
{ closeFitScale: 0.55517578125 }
{ lowerBound: 0.0625, upperBound: 1 }
{ iterations: 9 }
shfitty sh10x took (ms): 2.2276
{ closeFitScale: 0.11102294921875 }
{ lowerBound: 1, upperBound: 16 }
{ iterations: 8 }
shfitty sh0_1x took (ms): 2.1905
{ closeFitScale: 11.107421875 }
{ lowerBound: 1, upperBound: 4 }
{ iterations: 9 }
shfitty sh0_5x took (ms): 1.93
{ closeFitScale: 2.2216796875 }
```

Good result, over 10x speedup!