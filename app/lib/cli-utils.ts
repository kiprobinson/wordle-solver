import * as process from 'process';
import * as readline from 'readline';

/**
 * A few utilities for command line interfaces.
 */
class CliUtils {
  private static rl:readline.Interface = null;
  
  private static lazyInit() {
    if(!this.rl)
      this.rl = readline.createInterface(process.stdin, process.stdout);
  }
  
  /**
   * Async version of readline.question()
   */
  static ask(question: string):Promise<string> {
    this.lazyInit();
    return new Promise(resolve => {
      this.rl.question(question, answer => resolve(answer.trim()));
    })
  }
  
  /**
   * Asks the user to enter a boolean (y/n) response. If value entered is not valid
   * user is prompted to try again.
   */
  static async askForBoolean(question: string): Promise<boolean> {
    while(true) {
      const answer = (await this.ask(question + ' (y/n) ')).toLowerCase();
      if(answer === 'y' || answer === 'yes')
        return true;
      else if(answer === 'n' || answer === 'no')
        return false;
      
      // if we get here, user entered something that wasn't a valid y/n
      console.log();
      console.log(`Sorry, that's not a valid option. Try again!`);
    }
  }
  
  /**
   * Asks the user to enter an integer. If value entered is not a valid integer
   * in the allowed range, user is prompted to try again.
   */
  static async askForInteger(question: string, min:number=Number.MIN_SAFE_INTEGER, max:number=Number.MAX_SAFE_INTEGER):Promise<number> {
    const help = (min !== Number.MIN_SAFE_INTEGER && max !== Number.MAX_SAFE_INTEGER) ? ` (${min}-${max})` : '';
    // we loop until user has entered a valid option
    while(true) {
      const answer = await this.ask(question + help + ' ');
      if(/^-?\d+$/.test(answer)) {
        const n = Number(answer);
        if(min <= n && n <= max)
          return n;
      }
      
      // if we get here, user entered something that wasn't a valid integer
      console.log();
      console.log(`Sorry, that's not a valid option. Try again!`);
    }
  }

  /**
   * Prompts the user with a menu of options on the terminal, and waits for
   * them to enter the number of the option. Returns the index of the selected
   * option. If user enters invalid option, They are prompted to enter again.
   */
  static async menuPrompt(options: string[], prompt?:string):Promise<number> {
    prompt = prompt || 'What would you like to do?';
    
    console.log();
    console.log(prompt);
    for(let i = 0; i < options.length; i++)
      console.log(`${String(i+1).padStart(2)}: ${options[i]}`);
    
    console.log();
    
    // answer will be displayed with 1-based indexes, but code returns the zero-based index
    const answer = await this.askForInteger(`Enter your selection.`, 1, options.length);
    return answer - 1;
  };
  
  /**
   * Close the readline interface.
   */
  static async close() {
    if(this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}

export default CliUtils;
