# Lesson 4 - DOM Diffing

Lesson 4 points out some drawbacks to using plain template strings to update
UI when data changes. One solution is to use a concept known as DOM diffing.
This is where the template is used to generate a DOM chunk that is then diffed
against the corresponding live DOM chunk. Only the parts that are new are
updated. The diffing process can get pretty complicted pretty fast and that is
why many different frameworks have been created to handle the diffing process.
A small library called [reef](https://reefjs.com/) is provided to handle diffing for this workshop.

