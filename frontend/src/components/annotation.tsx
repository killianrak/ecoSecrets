import { Box, Button, Divider, FormControlLabel, Grid, IconButton, MenuItem, Paper, Stack, styled, Switch, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMainContext } from "../contexts/mainContext";
import PhotoIcon from '@mui/icons-material/Photo';
import AddIcon from '@mui/icons-material/Add';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import { v4 as uuidv4 } from 'uuid';
import "../css/annotation.css";
import React from "react";
import { FilesService } from "../client";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import GridViewIcon from '@mui/icons-material/GridView';



const LayoutImageContainer = styled("div")({
  flexGrow: 1,
  display: "grid",
  gridTemplateColumns: "repeat(12, 1fr)",
  columnGap: "1rem",
  rowGap: "1rem",
});

const LayoutImageImage = styled("div")(({ theme }) => ({
  gridColumn: "1/8",
  [theme.breakpoints.down("md")]: {
    gridColumn: "1/13",
    gridRow: "1/5",
  }
}));

const LayoutImageForm = styled("div")(({ theme }) => ({
  gridColumn: "8/13",
  [theme.breakpoints.down("md")]: {
    gridColumn: "1/13",
    gridRow: "5/9",
  },
  overflowY: "scroll",
}));

type AnnotationType = {
  id:string;
  specie:string, 
  number: number, 
  sex: string, 
  behaviour: string, 
  life_stage: string, 
  biological_state: string;
  comment: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  valueTab: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, valueTab, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={valueTab !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {valueTab === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


const Annotation = () => {
  const {
    projects,
    setCurrentDeployment,
    setCurrentImage,
    currentImage,
    files,
    updateListFile
  } = useMainContext();
  let params = useParams();

  const [value, setValue] = React.useState(0);
  const image = (): any | null => {
    return files.find((f) => f.id === currentImage);
  };

  useEffect(() => {
    (async () => {
      setCurrentDeployment(Number(params.deploymentId));
      setCurrentImage(params.imageId);
    })();
  }, [projects]);

  useEffect(() => {
    (async () => {
      image() && setObservations(image().annotations);
    })();
  }, [files, currentImage]);

  const updateUrl = (id) => {
    const url = new URL(window.location.toString());
    url.pathname = `deployment/${Number(params.deploymentId)}/${id}`;
    window.history.pushState({}, "", url);
  };

  const previous = () => {
    files.forEach((f, i) => {
      if (f.id === currentImage) {
        let ind = i === 0 ? (i = files.length) : i;
        setCurrentImage(files[ind - 1].id);
        
        updateUrl(files[ind - 1].id);
      }
    });
  };

  const next = () => {
    files.forEach((f, i) => {
      if (f.id === currentImage) {
        let ind = i === files.length - 1 ? -1 : i;
        setCurrentImage(files[ind + 1].id);
        updateUrl(files[ind + 1].id);
      }
    });
  };

  const save = () => {
    FilesService.updateAnnotationsFilesAnnotationFileIdPatch(currentImage, observations).then(res => updateListFile())
    // WARNING remplacer le updateListFile par une mise à jour local des fichiers
  };

  const saveandnext = () => {
    save();
    next();
  };

  const sexList = ["Mâle", "Femelle", "Indéterminé"];
  const behaviourList = ["Comportement A", "Comportement B", "Comportement C"];
  const lifeStageList = ["Oeuf", "Juvénile", "Adulte"];
  const biologicalStateList = ["Vivant", "Mort"];
  
  const [observations, setObservations] = useState<AnnotationType[]>([]);
  const [checked, setChecked] = React.useState(observations.length === 0);
  const [isSpecies, setIsSpecies] = React.useState(true);
  
  useEffect(() => {
    (async () => {
      setChecked(observations.length === 0);
    })();
  }, [observations]);

  const handleCheckChange = () => {
    setChecked(!checked);
    if (checked === false) {
      setObservations([]);
      setIsSpecies(true);
    };
  };

  const handleAddObservation = () => {
    if (isSpecies) {
      setObservations([...observations, { id: uuidv4(), specie: '', number: 0, sex: '', behaviour: '', life_stage: '', biological_state: '', comment: "" }])
    };
    if (checked) { setChecked(false) };
    setIsSpecies(false);
  }

  const handleDeleteObservation = (id: string) => {
    let i = observations && observations.findIndex((obs) => obs.id === id);
    let tmp_obs = [...observations]
    i !== -1 && tmp_obs.splice(i,1);
    i !== -1 && setObservations(tmp_obs);
    i === observations.length-1 && setIsSpecies(true);
  }

  const imageIndex = () => {
    return (files && files.findIndex((f) => f.id === currentImage)+1);
  } 

  const handleFormChange = (id: string, params:string,  e: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>) => {
    let tmp_obs = [...observations]
    tmp_obs.forEach(ob => {
      if(ob.id === id){
        ob[params] = e.target.value;
        if (params === 'specie') {
          setIsSpecies(true);
        }
      }
    })
    setObservations(tmp_obs);
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  
  return (
    
    <LayoutImageContainer className="page">
      <LayoutImageImage>{
        image() ? (
          <Grid container className="pageContainer">
          <Box sx={{ height: 300}} className="boxImage">
            <img
              src={`${image().url}`}
              alt={image().name}
              loading="lazy"
              style={{
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                display: "block",
                height: "fit-content",
                maxWidth: "100%"
              }}
            />
          </Box>
            <div className="groupNumber">
          <Grid
              container
              direction="row"
              justifyContent="space-around"
              alignItems="center"
              spacing={5}
          > 
            <Grid item>
              <IconButton>
                <PhotoIcon/>
              </IconButton>
              <Switch />
              <IconButton>
                <GridViewIcon fontSize='large'/>
              </IconButton>
            </Grid>
            
            <Grid item>
              <IconButton>
                <FastRewindIcon fontSize='large'/>
              </IconButton>
              <IconButton  onClick={() => previous()} >
                <SkipPreviousIcon fontSize='large'/>
              </IconButton>
              <IconButton>
                <Typography variant="h6" style={{backgroundColor: "#f5f5f5"}}>{imageIndex() + ' | ' + files.length}</Typography>
              </IconButton>
              <IconButton  onClick={() => next()}>
                < SkipNextIcon fontSize='large'/>
              </IconButton>
              <IconButton >
                <FastForwardIcon fontSize='large'/>
              </IconButton>
             </Grid >

            <Grid item>
              <IconButton >
                <FullscreenIcon fontSize='large'/>
              </IconButton>
            </Grid>
            
            </Grid>
        </div>
        </Grid>
          
        ) : (
          <>
            <h2>image inconnue</h2>
          </>
        )}
      </LayoutImageImage>
      
      <LayoutImageForm className="annotations">
      <Paper elevation={1}>
        <Stack spacing={2} className='stackAnnotations'>
          <Typography variant="h3">Annotation</Typography>
          <Tabs value={value} aria-label="basic tabs example" variant='fullWidth'>
            <Tab label="Observation(s)" />
            <Tab label="Métadonnées" />
          </Tabs>
              <TabPanel valueTab={value} index={0}>

           
            <FormControlLabel control={
              <Switch defaultChecked onChange={handleCheckChange}/>
            } 
              label="Média vide" 
            />
            <Divider/>

              {observations.map((observation) => (

                <form key={observation.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Typography variant="h6">{`Observation ${observation.id}`}</Typography>
                    <IconButton onClick = {() => handleDeleteObservation(observation.id)} >
                      <ClearTwoToneIcon/>
                    </IconButton>
                  </Stack>

                  <Grid container spacing={1}>
                    <Grid item lg={6}>
                      <TextField
                        name="species"
                        label="Espèce"
                        size="small"
                        variant='filled'
                        fullWidth
                        value={observation.specie}
                        onChange={(e) => handleFormChange(observation.id, "specie", e)}
                      />
                    </Grid>
                    <Grid item lg={6}>
                      <TextField
                        name="number"
                        label="Nombre d'individus"
                        size="small"
                        variant='filled'
                        inputProps={{ type: 'number' }}
                        value={observation.number}
                        onChange={(e) => handleFormChange(observation.id, "number", e)}
                      />
                    </Grid>
                    <Grid item lg={6}>
                      <TextField
                        id="sex"
                        select
                        label="Sexe"
                        variant='filled'
                        value={observation.sex}
                        onChange={(e) => handleFormChange(observation.id, "sex", e)}
                        size="small"
                        fullWidth
                      >
                        {sexList.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item lg={6}>
                      <TextField
                        id="behaviour"
                        select
                        label="Comportement"
                        size="small"
                        variant='filled'
                        value={observation.behaviour}
                        onChange = {(e) => handleFormChange(observation.id, "behaviour",e)}
                        fullWidth
                      >
                        {behaviourList.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item lg={6}>
                      <TextField
                        id="lifeStage"
                        select
                        label="Stade de vie"
                        size="small"
                        variant='filled'
                        value={observation.life_stage}
                        onChange={(e) => handleFormChange(observation.id, "life_stage", e)}
                        fullWidth
                      >
                        {lifeStageList.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item lg={6}>
                      <TextField
                        id="biologicalState"
                        select
                        label="Etat biologique"
                        size="small"
                        variant='filled'
                        value={observation.biological_state}
                        onChange={(e) => handleFormChange(observation.id, "biological_state", e)}
                        fullWidth
                      >
                        {biologicalStateList.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item lg={12}>
                      <TextField
                        id="comment"
                        name="comment"
                        label="Commentaire"
                        size="small"
                        variant='filled'
                        value={observation.comment}
                        onChange={(e) => handleFormChange(observation.id, "comment", e)}
                        fullWidth
                        />
                    </Grid>
                    </Grid>
                  </form>
                  )) } 
             </TabPanel>
             <Divider/>
          
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            height={"auto"}
            // style={{position: 'fixed'}}
          >
            <Stack direction="row" justifyContent="flex-start" spacing={2}>
              <Button  startIcon={<AddIcon/>} onClick={() => handleAddObservation()} variant="contained" style={{backgroundColor: "#BCAAA4"}}>
                 Nouvelle observation
              </Button>
            </Stack>
            
            <Stack justifyContent="flex-end">
              <Button variant="contained" onClick={() => saveandnext()} style={{backgroundColor: "#2FA37C"}}>
                Enregistrer et continuer
              </Button>
            </Stack>
          </Stack>
        </Stack>
        </Paper>
      </LayoutImageForm>
    
    </LayoutImageContainer>
  );
};
export default Annotation;
