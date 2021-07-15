#!/usr/bin/env node

const chalk = require('chalk')
const convert = require('../src/convert')
const fs = require('fs')
const io = require('caporal')
const pkginfo = require('pkginfo')
const { HarToK6Error } = require('../src/error')
const { DEFAULT_CLI_OPTIONS } = require('../src/constants')

class CommandLineError extends HarToK6Error {}

pkginfo(module, 'version')
const version = module.exports.version
delete module.exports.version

io.version(version)
  .description('Convert LI-HAR to k6 script')
  .option(
    '-o, --output <output>',
    'Output file',
    output,
    DEFAULT_CLI_OPTIONS.output
  )
  .option(
    '--add-sleep',
    'Add automatic sleep() based on startDateTime',
    DEFAULT_CLI_OPTIONS.addSleep
  )
  .argument('<archive>', 'LI-HAR archive to convert')
  .action(run)

io.parse(process.argv)

function output(value) {
  if (fs.existsSync(value) && fs.lstatSync(value).isDirectory()) {
    throw new Error(`Cannot overwrite directory '${value}'`)
  }
  return value
}

async function run(arg, opt, log) {
  try {
    start(arg.archive, log)
    const json = read(arg.archive)
    const archive = parse(json)
    const { main } = await transform(archive, opt)
    write(main, opt.output)
    success(opt.output, log)
  } catch (error) {
    inform(error, log)
  }
}

function start(file, log) {
  log.info(chalk.green(`Converting '${file}'`))
}

function read(file) {
  try {
    return fs.readFileSync(file, { encoding: 'utf8' })
  } catch (error) {
    throw new CommandLineError({ name: 'ReadError', cause: error })
  }
}

function parse(json) {
  try {
    return JSON.parse(json.trim())
  } catch (error) {
    throw new CommandLineError({ name: 'ParseError', cause: error })
  }
}

async function transform(archive, options) {
  try {
    return await convert(archive, options)
  } catch (error) {
    throw new CommandLineError({ name: 'ConvertError', cause: error })
  }
}

function write(main, output) {
  try {
    fs.writeFileSync(output, main)
  } catch (error) {
    throw new CommandLineError({ name: 'WriteError', cause: error })
  }
}

function success(output, log) {
  log.info(chalk.green(`Wrote k6 script to '${output}'`))
}

function inform(error, log) {
  log.error(`${summarize(error)}:`)
  const source = cause(error)
  log.error(chalk.red(source.message))
  log.debug(source.stack)
}

function summarize(error) {
  if (error instanceof CommandLineError) {
    switch (error.name) {
      case 'ReadError':
        return 'Error reading archive file'
      case 'ParseError':
        return 'Error parsing archive'
      case 'ConvertError':
        return 'Error converting archive'
      case 'WriteError':
        return 'Error writing output'
      default:
        return 'Could not convert archive'
    }
  } else {
    return 'Could not convert archive'
  }
}

function cause(error) {
  if (error instanceof CommandLineError) {
    return error.cause()
  } else {
    return error
  }
}
