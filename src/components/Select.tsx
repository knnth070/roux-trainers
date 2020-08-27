import React from 'react'

import {
    FormControlLabel, FormGroup, Button, makeStyles, Box,
    FormControl, FormLabel, RadioGroup, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions
} from '@material-ui/core';

import SettingsIcon from '@material-ui/icons/Settings';

import Radio from '@material-ui/core/Radio';

import { AppState, Config, Action } from '../Types';
import { Selector } from '../lib/Selector';


const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
      backgroundColor: theme.palette.background.default
    },
    button: {
      width: "100%",
    },
    paper: {
      padding: theme.spacing(3),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    canvasPaper: {
      padding: theme.spacing(0),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    infoColumn: {
      color: theme.palette.background.paper
    },
    scrambleColumn: {
      paddingLeft: theme.spacing(3)
    },
    textColumn: {
      // color: "black",
      [theme.breakpoints.up('sm')]: {
        minHeight: 138
      },
    },
    fixedHeight: {
      height: 250,
    },
    title : {
        flexGrow: 1,
    },
    select: {
      color: theme.palette.text.primary
    },
    selectLabel: {
      color: theme.palette.text.secondary
    }

}))

function SingleSelect(props: {state: AppState, dispatch: React.Dispatch<Action>,
    select: (c: Config) => Selector, label?: string}) {
    let { state, dispatch, select } = props
    let { config } = state
    let sel = select(config)
    let classes = useStyles()

    const handleChange = (evt: { target: { value: string; }; }) => {
      let { names } = sel
      let n = names.length
      let new_flags = Array(n).fill(0)

      for (let i = 0; i < names.length; i++) {
        if (names[i] === evt.target.value) {
          new_flags[i] = 1
        }
      }
      let new_config = JSON.parse(JSON.stringify(config))
      select(new_config).flags = new_flags
      if (new_config.fbPairSolvedSelector.flags[1] === 1) {
        new_config.fbdrSelector.flags = [1, 0, 0]
      }
      dispatch( { type: "config", content: new_config })
    }

    let radioValue = function() {
      let { names, flags } = sel
      for (let i = 0; i < flags.length; i++) {
        if (flags[i] === 1) return names[i]
      }
      return ""
    }()

    let label = sel.label || props.label || ""
    return (
      <FormControl component="fieldset" className={classes.select}>
      <FormLabel component="legend"className={classes.selectLabel} >{label}</FormLabel>
      <RadioGroup aria-label="position" name="position" value={radioValue} onChange={handleChange} row>
        {
          sel.names.map(name => (
            <FormControlLabel
              key={name}
              value={name}
              control={<Radio color="primary" />}
              label={name}
              labelPlacement="end"
            />
          ))
        }
      </RadioGroup>
    </FormControl>)
  }



  type MultiOptions = {
    label?: string, noDialog?: boolean,
    manipulators?: {name: string, enableIdx: number[]}[]
  }


  function MultiSelectContent(props: {state: AppState, dispatch: React.Dispatch<Action>, select: (c: Config) => Selector, options?: MultiOptions }) {
    let { state, dispatch, select, options } = props
    options = options || {}
    let { config } = state

    let sel = select(config)
    const handleChange = (evt: { target: { value: string; checked: boolean }; }) => {
      let { names, flags } = sel
      let new_flags = [...flags]

      for (let i = 0; i < names.length; i++) {
        if (names[i] === evt.target.value) {
          new_flags[i] = (evt.target.checked)? 1 : 0
        }
      }
      let new_config = JSON.parse(JSON.stringify(config))
      select(new_config).flags = new_flags
      dispatch( { type: "config", content: new_config })
    }

    let makeBox = (name: string, checked: boolean) => {
      return (
      <FormControlLabel
          control={
          <Checkbox color="primary" checked={checked} onChange={handleChange} />
          }
          label={name}
          key={name}
          value={name}
      />)
    }

    const [manipChecked, setManipChecked] = React.useState< { [ name: string ]: boolean } >({})
    let label = sel.label || options.label || ""
    let makeManipulator = (manip: {name: string, enableIdx: number[]}) => {
      let {name, enableIdx} = manip
      let handleChange = (evt: { target: { value: string; checked: boolean }; }) => {
        setManipChecked( {...manipChecked, [name] : evt.target.checked } )
        let fillValue = (evt.target.checked);
        let { flags } = sel
        let new_flags = [...flags]
        for (let i of enableIdx) {
          new_flags[i] = fillValue ? 1 : 0;
        }
        let new_config = JSON.parse(JSON.stringify(config))
        select(new_config).flags = new_flags;
        dispatch( { type: "config", content: new_config } )
      }
      return (
        <FormControlLabel
        control={
        <Checkbox color="primary" checked={manipChecked[name]} onChange={handleChange} />
        }
        label={name}
        key={name}
        value={name}
        />)
    }
    let manipulator_row = options.manipulators ?
      (<FormGroup row>
      {options.manipulators.map(x => makeManipulator(x)) }
      </FormGroup>) : null;
    const content = (
      <React.Fragment>
        {manipulator_row}
        <FormGroup row>
        {sel.names.map( (name, i) => makeBox(name, !!sel.flags[i]))}
        </FormGroup>
      </React.Fragment>
    )
    return {label, content}
  }

  function MultiSelect(props: {state: AppState, dispatch: React.Dispatch<Action>, select: (c: Config) => Selector, options?: MultiOptions }) {
    let { state, dispatch, select, options } = props
    let {label, content} = MultiSelectContent({state, dispatch, select, options})
    options = options || {}

    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    }
    let classes = useStyles()

    if (options.noDialog)
    return (
      <FormControl component="fieldset" className={classes.select}>
        <FormLabel component="legend"className={classes.selectLabel} >{label}</FormLabel>
        {content}
      </FormControl>
    )

    return (
    <div>
      <FormLabel component="legend">{label}</FormLabel>
      <Box height={8}/>
      <Button color="primary" variant="outlined" style={{borderWidth: 2}} onClick={handleClickOpen}>
      <SettingsIcon fontSize="small" color="primary" style={{marginLeft: -6, marginRight: 3}}></SettingsIcon>
        Edit
      </Button>
      <Box height={8}/>
      <Dialog disableBackdropClick disableEscapeKeyDown open={open} onClose={handleClose}>
        <DialogTitle> {label} </DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary">
              Ok
            </Button>
        </DialogActions>
      </Dialog>
    </div>
    )
  }

  export { SingleSelect, MultiSelectContent, MultiSelect }