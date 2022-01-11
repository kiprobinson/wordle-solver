import CliUtils from '../lib/cli-utils';
import dumpStats from "./dump-stats";
import dumpWordRatings from './dump-word-ratings';
import evaluateSolver from './evaluate-solver';
import cheatAtWordle from './wordle-cheater';

const menuOptions:Array<{name:string, handler:Function}> = [
  {
    name: 'Cheat at Wordle ;)',
    handler: cheatAtWordle,
  },
  {
    name: 'Show the best words to start with.',
    handler: dumpWordRatings,
  },
  {
    name: 'Show character frequencies in the word list.',
    handler: dumpStats,
  },
  {
    name: 'Test the solver (see how many guesses it takes to get the correct word, for every word in the list).',
    handler: evaluateSolver,
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
    
    console.log();
    done = !(await CliUtils.askForBoolean('Do you want to do anything else?'));
  }
  
  console.log();
  console.log('-------------------------------------');
  console.log('       *- Have a great day! -*       ');
  console.log('-------------------------------------');
  
  CliUtils.close();
}

export default runCli;
