// Test file to verify hua-motion entrypoints
import * as mainExport from '@hua-labs/motion';
import * as coreExport from '@hua-labs/motion/core';
import * as pageExport from '@hua-labs/motion/page';
import * as elementExport from '@hua-labs/motion/element';
import * as scrollExport from '@hua-labs/motion/scroll';
import * as experimentsExport from '@hua-labs/motion/experiments';

console.log('Main export keys:', Object.keys(mainExport));
console.log('Core export keys:', Object.keys(coreExport));
console.log('Page export keys:', Object.keys(pageExport));
console.log('Element export keys:', Object.keys(elementExport));
console.log('Scroll export keys:', Object.keys(scrollExport));
console.log('Experiments export keys:', Object.keys(experimentsExport));

console.log('✅ All entrypoints loaded successfully');
