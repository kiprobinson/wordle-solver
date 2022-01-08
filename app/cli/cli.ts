import * as process from 'process';
import * as readline from 'readline';
import CliUtils from '../lib/cli-utils';
import dumpStats from "./dump-stats";

const menuOptions:Array<{name:string, handler:Function}> = [
  {
    name: 'Dump wordlist stats.',
    handler: dumpStats,
  }
];

/**
 * Run the command line interface to this app.
 */
const runCli = async() => {
  const rl = readline.createInterface(process.stdin, process.stdout);
  console.log(' *- Welcome to the Wordle Solver! -* ');
  console.log('-------------------------------------');
  console.log('');
  
  const cliPrompts = new CliUtils(rl);
  const selection = await cliPrompts.menuPrompt(menuOptions.map(o => o.name));
  
  await menuOptions[selection].handler();
  
  rl.close();
}


export default runCli;