import { useEffect, useRef } from 'react';

export function useInterval(callback, delay) {

    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        let id = null;
        if (delay)
            id = setInterval(tick, delay);
        return () => {
            if (id != null)
                clearInterval(id);
        }
    }, [delay]);
}

export function binaryFind(search, arr) {
    var minIndex = 0;
    var maxIndex = arr.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = arr[currentIndex];

        if (currentElement.email < search) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement.email > search) {
            maxIndex = currentIndex - 1;
        }
        else {
            return {
                found: true,
                index: currentIndex
            };
        }
    }

    return {
        found: false,
        index: currentElement < search ? currentIndex + 1 : currentIndex
    };
};

export function insert(index, newItem, arr) {
    return [
        // part of the array before the specified index
        ...arr.slice(0, Math.max(index, 0)),
        // inserted item
        newItem,
        // part of the array after the specified index
        ...arr.slice(Math.max(index, 0))
    ];
};

export function isPositiveInteger(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) && // ...and ensure strings of whitespace fail
        !str.includes(".") && // and ensure it is an integer
        !str.startsWith("0") &&
        !str.startsWith("-")
};

export function isInteger(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) && // ...and ensure strings of whitespace fail
        !str.includes(".") // and ensure it is an integer
};