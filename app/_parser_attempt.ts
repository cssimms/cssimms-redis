// Attempted to write a character - by character parser at first, it's harder than it sounds

// read from the element count header *1
// for each element, read the length $L to slice into characters of that long

// const inputCopy = input.slice()

// let elementCount = 0
// let currentChar: string | undefined;

// let currentElementLength = 0
// let onElement = false
// let currentElement = []
// let currentElementIndex = 0

// let skipNext = false

// for (let i = 0; i < inputCopy.length; i++) {
//     if (skipNext) {
//         console.log("hit skipNext, index: ", i)
//         skipNext = false
//         continue;
//     }

//     currentChar = inputCopy[i]
//     console.log("Processing next char: ", currentChar)

//     // We are already parsing an element, so collect the characters for processing
//     if (onElement) {

//     }

//     if (currentChar === '*') {
//         // Next character should be the elementCount.
//         // Track it now, and skip it
//         // This assumes that we have less than 10 elements :grimace:
//         elementCount = Number(inputCopy[i + 1])
//         skipNext = true
//         continue;
//     }


//     if (currentChar === '$') {
//         // Next char is the element length
//         currentElementLength = Number(inputCopy[i + 1])
//         skipNext = true
//         onElement = true
//     }
// }
