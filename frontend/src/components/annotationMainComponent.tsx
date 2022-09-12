import { Divider, FormControlLabel, Paper, Stack, styled, Switch, Tab, Tabs, Typography } from "@mui/material";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMainContext } from "../contexts/mainContext";
import { v4 as uuidv4 } from 'uuid';
import { Annotation, FilesService } from "../client";
import AnnotationObservationForm from "./annotationObservationForm";
import AnnotationImageDisplay from "./annotationImageDisplay";
import AnnotationButtons from "./annotationButtons";
import AnnotationSaveError from "./annotationSaveError";
import "../css/annotation.css";
import TabPanel from "./tabPanel";

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

const AnnotationMainComponent = () => {
  const {
    projects,
    setCurrentDeployment,
    currentImage, setCurrentImage,
    files,
    updateListFile
  } = useMainContext();

  let params = useParams();

  const [observations, setObservations] = useState<Annotation[]>([]);
  const tmpObservation = { id: uuidv4(), specie: "", life_stage: "", biological_state: "", comment: "", behaviour: "", sex: "",  number: 0};
  const [isMinimalObservation, setIsMinimalObservation] = useState(observations.length == 0)
  
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const [openSaveErrorDialog, setOpenSaveErrorDialog] = useState(false);
  const handleCloseSaveErrorDialog = () => {
    setOpenSaveErrorDialog(false);
  };

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

  useEffect(() => {
    (async () => {
      setChecked(observations.length === 0);
    })();
  }, [observations]);

  const updateUrl = (id) => {
    const url = new URL(window.location.toString());
    url.pathname = `/project/${Number(params.projectId)}/deployment/${Number(params.deploymentId)}/${id}`;
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
    FilesService
      .updateAnnotationsFilesAnnotationFileIdPatch(currentImage, observations)
      .then(res => 
          updateListFile()
      )
    // WARNING remplacer le updateListFile par une mise à jour local des fichiers
  };

  const saveandnext = () => {
    if (isMinimalObservation) {
      save();
      next();
    }
    else {
      setOpenSaveErrorDialog(true);
    }
  };

  const handleAddObservation = () => {
    if (isMinimalObservation) {
      setObservations([...observations, tmpObservation]);
    };
    if (checked) { 
      setChecked(false);
    };
    setIsMinimalObservation(false);
  };

  const handleDeleteObservation = (id: string) => {
    let i = observations && observations.findIndex((obs) => obs.id === id);
    let tmp_obs = [...observations]
    i !== -1 && tmp_obs.splice(i,1);
    i !== -1 && setObservations(tmp_obs);
    i === observations.length-1 && setIsMinimalObservation(true);
  };

  const [checked, setChecked] = useState<boolean>(observations.length === 0);
  
  const handleCheckChange = () => {
    if (!checked) {
      setObservations([]);
      setIsMinimalObservation(true);
    };
    if (checked) {
      setObservations([...observations, tmpObservation]);
      setIsMinimalObservation(false);
    };
    setChecked(!checked);
  };
  
  const handleFormChange = (id: string, params:string,  e: ChangeEvent<HTMLInputElement| HTMLTextAreaElement>) => {
      let tmp_obs = [...observations]
      tmp_obs.forEach(ob => {
          if(ob.id === id){
              ob[params] = e.target.value;
              if (params === 'specie') {
                ob["number"] = 1;
                setIsMinimalObservation(true);
              }
          }
      })
      setObservations(tmp_obs);
  };
  
  return (  
    <LayoutImageContainer className="page">

      <LayoutImageImage>
        <AnnotationImageDisplay image={image()} next={next} previous={previous}/>
      </LayoutImageImage>
      
      <LayoutImageForm className="annotations">
        <Paper elevation={1} className='paperAnnotations'>
          <Stack spacing={2} className='stackAnnotations'>
            <Typography variant="h3">Annotation</Typography>
            <Tabs 
              value={tabValue} 
              aria-label="basic tabs example" 
              variant='fullWidth'
              onChange={handleTabChange} 
            >
              <Tab label="Observation(s)" />
              <Tab label="Métadonnées" />
            </Tabs>
            
            <TabPanel valueTab={tabValue} index={0}>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={checked}
                    onChange={handleCheckChange}/>
                } 
                label="Média vide" 
              />

              <Divider/>

              {observations.map((observation) => (
                <AnnotationObservationForm observation={observation} handleFormChange={handleFormChange} handleCheckChange={handleCheckChange} handleDeleteObservation={handleDeleteObservation}/>
              )) } 
            </TabPanel>

            <TabPanel valueTab={tabValue} index={1}>
              Formulaire de métadonnées à venir
            </TabPanel>

            <Divider/>
            
            <AnnotationButtons 
              saveandnext={saveandnext} 
              handleAddObservation={handleAddObservation}
            />

          </Stack>
        </Paper>
      </LayoutImageForm>

      <AnnotationSaveError 
        openSaveErrorDialog={openSaveErrorDialog} handleCloseSaveErrorDialog={handleCloseSaveErrorDialog}
      />
    </LayoutImageContainer>
  );
};
export default AnnotationMainComponent;