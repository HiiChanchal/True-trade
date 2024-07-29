import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('')
@Controller('')
export class AppController {
  constructor() { }

  @Get()
  getHello(): string {
    return `Current time is ${new Date().toLocaleTimeString()}`;
  }
}
