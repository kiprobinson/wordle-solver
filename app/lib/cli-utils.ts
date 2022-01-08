import * as readline from 'readline';

/**
 * A few utilities for command line interfaces.
 */
class CliUtils {
  readonly rl:readline.Interface;
  
  /**
   * @param rl Instance of node readline interface. This is *not* closed by this app.
   */
  constructor(rl:readline.Interface) {
    this.rl = rl;
  }
  
  /**
   * Async version of readline.question()
   */
  ask(question: string):Promise<string> {
    return new Promise(resolve => {
      this.rl.question(question, answer => resolve(answer));
    })
  }

  /**
   * Prompts the user with a menu of options on the terminal, and waits for
   * them to enter the number of the option. Returns the index of the selected
   * option. If user enters invalid option, They are prompted to enter again.
   */
  async menuPrompt (options: string[], prompt?:string):Promise<number> {
    prompt = prompt || 'What would you like to do?';
    
    //we exit loop by returning, when user enters a valid selection
    while(true) {
      console.log();
      console.log(prompt);
      for(let i = 0; i < options.length; i++)
        console.log(`${i+1}: ${options[i]}`);
      
      console.log();
      let answer = await this.ask(`Enter your selection (1-${options.length}): `);
      answer = answer.trim();
      if(/^\d+$/.test(answer)) {
        let selection = Number(answer);
        if(0 < selection && selection <= options.length)
          return selection - 1;
      }
      
      //if we get here, user has made an invalid selection
      console.log();
      console.log(`Sorry, that's not a valid option. Try again!`);
    }
  };
}

export default CliUtils;
