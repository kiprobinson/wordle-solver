import * as process from 'process';
import * as readline from 'readline';

type AskOptions = {
  /** Prompt to give the user when asking question. */
  question: string;
  
  /** Apply formatting to the answer before validating (i.e. toLowerCase). */
  formatter?: {(answer:string):string};
  
  /** Validation regex to determine if the user's input is valid. */
  regex?: RegExp;
  
  /** Validation callback to determine if the user's input is valid. */
  validator?: {(answer:string):boolean};
  
  /** Message that will be shown to user if they enter an invalid option. */
  retryMessage?: string;
}

type CliColor = 'black'|'red'|'yellow'|'green'|'cyan'|'blue'|'magenta'|'white';

/**
 * A few utilities for command line interfaces.
 */
class CliUtils {
  private static rl:readline.Interface|null = null;
  
  /**
   * Lazy-loads the readline interface.
   */
  private static getRl():readline.Interface {
    if(!this.rl)
      this.rl = readline.createInterface(process.stdin, process.stdout);
    return this.rl;
  }
  
  /**
   * Async version of `readline.question()`.
   */
  private static askImpl(question: string):Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.getRl().question(question.trimEnd() + ' ', answer => resolve(answer.trim()));
      }
      catch (err) {
        reject(err);
      }
    })
  }
  
  /**
   * Asks the user a question on the command line, and awaits their answer.
   * If validation is specified, and the user inputs an invalid answer,
   * they are asked to try again until they enter a valid response.
   */
  static async ask(options:AskOptions):Promise<string> {
    while(true) {
      let answer = await this.askImpl(options.question);
      let answerValid = true;
      
      if(options.formatter)
        answer = options.formatter(answer);
      
      if(answerValid && options.regex) {
        if(!options.regex.test(answer))
          answerValid = false;
      }
      
      if(answerValid && options.validator) {
        if(!options.validator(answer))
          answerValid = false;
      }
      
      if(answerValid)
        return answer;
      
      // if we get here, user entered something that wasn't a valid
      console.log();
      console.log(options.retryMessage || `Sorry, that's not a valid option. Try again!`);
    }
  }
  
  /**
   * Asks the user to enter a boolean (y/n) response. If value entered is not valid
   * user is prompted to try again.
   */
  static async askForBoolean(question: string): Promise<boolean> {
    const askOptions:AskOptions = {
      question: question + ' (y/n)',
      formatter: (answer:string):string => answer.toLowerCase(),
      regex: /^(?:y|yes|n|no)$/i,
    }
    
    const answer = await this.ask(askOptions);
    return (answer === 'y' || answer === 'yes');
  }
  
  /**
   * Asks the user to enter an integer. If value entered is not a valid integer
   * in the allowed range, user is prompted to try again.
   */
  static async askForInteger(question: string, min:number=Number.MIN_SAFE_INTEGER, max:number=Number.MAX_SAFE_INTEGER):Promise<number> {
    const help = (min !== Number.MIN_SAFE_INTEGER && max !== Number.MAX_SAFE_INTEGER) ? ` (${min}-${max})` : '';
    const askOptions:AskOptions = {
      question: question + help,
      regex: /^-?\d+$/,
      validator: (answer:string):boolean => {
        const n = Number(answer);
        return Number.isInteger(n) && min <= n && n <= max;
      }
    };
    return Number(await this.ask(askOptions));
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
  
  /**
   * Returns a string with the escape sequences to change the color of the text in the terminal.
   */
  static cliColorString(message:string, colors:{foreground?:CliColor, background?:CliColor}):string {
    const reset = "\x1b[0m";
    
    const fg:Record<CliColor, string> = {
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
    };
    
    const bg:Record<CliColor, string> = {
      black: "\x1b[40m",
      red: "\x1b[41m",
      green: "\x1b[42m",
      yellow: "\x1b[43m",
      blue: "\x1b[44m",
      magenta: "\x1b[45m",
      cyan: "\x1b[46m",
      white: "\x1b[47m",
    };
    
    let formatted = '';
    if (colors.foreground)
      formatted += fg[colors.foreground];
    if (colors.background)
      formatted += bg[colors.background];
    formatted += message;
    formatted += reset;
    
    return formatted;
  }
}

export default CliUtils;
