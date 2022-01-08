import CliUtils from '../lib/cli-utils';
import dumpStats from "./dump-stats";
import dumpWordRatings from './dump-word-ratings';

const menuOptions:Array<{name:string, handler:Function}> = [
  {
    name: 'Show the best and worst words to start with.',
    handler: dumpWordRatings,
  },
  {
    name: 'Show character frequencies in the word list.',
    handler: dumpStats,
  },
];

/**
 * Run the command line interface to this app.
 */
const runCli = async() => {
  console.log('-------------------------------------');
  console.log(' *- Welcome to the Wordle Solver! -* ');
  console.log('-------------------------------------');
  
  let done = false;
  while(!done) {
    const selection = await CliUtils.menuPrompt(menuOptions.map(o => o.name));
    await menuOptions[selection].handler();
    
    console.log()
    done = !(await CliUtils.askForBoolean('Do you want to do anything else?'));
  }
  
  console.log();
  console.log('-------------------------------------');
  console.log('       *- Have a great day! -*       ');
  console.log('-------------------------------------');
  
  CliUtils.close();
}

export default runCli;
