import { SearchIcon } from "@chakra-ui/icons";
import { Stack, Input, Text, IconButton, Box, Image, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Spinner, Skeleton, Select } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";

const PromptEntry = () => {
    const [prompt, setPrompt] = useState('');
    const [negPrompt, setNegPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [models, setModels] = useState<{title: 'string', model_name: 'string', hash: string}[]>([]);
    const [scripts, setScripts] = useState([]);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [selectedScript, setSelectedScript] = useState<string | null>(null);
    const [steps, setSteps] = useState(5)
    const onPromptChange = (ev: ChangeEvent<HTMLInputElement>) => setPrompt(ev.target.value);
    const onNegPromptChange = (ev: ChangeEvent<HTMLInputElement>) => setNegPrompt(ev.target.value);
    const onModelChange = (ev: ChangeEvent<HTMLSelectElement>) => setSelectedModel(ev.currentTarget.value);
    const onScriptChange = (ev: ChangeEvent<HTMLSelectElement>) => setSelectedScript(ev.currentTarget.value);
   
    const [images, setImages] = useState([]);

    //Fetch all the data to setup our prompt entry
    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const modelUrl = "http://127.0.0.1:7860/sdapi/v1/sd-models";
            const modelResp = await axios.get(modelUrl)
            setModels(modelResp.data);
            const scriptsUrl = "http://127.0.0.1:7860/sdapi/v1/scripts"
            const scriptsResp = await axios.get(scriptsUrl);
            setScripts(scriptsResp.data.txt2img);
            console.dir(scriptsResp.data.txt2img)
            setIsLoading(false);
        })()      

    }, [])

    

    const onSubmitHandler = async (_) => {
        const url = "http://127.0.0.1:7860/sdapi/v1/txt2img";
        let body: {
            prompt: string;
            negativePrompt: string;
            width: number;
            height: number;
            steps: number;
            override_settings?: unknown;
            script_name?: string;
        } = {
            prompt,
            negativePrompt: negPrompt,
            width: 512,
            height: 768,
            steps: steps,
            script_name: selectedScript ?? undefined
        }

        if(selectedModel) {
            body = {
                ...body,
                override_settings: {
                    sd_model_checkpoint: `${selectedModel}`
                }
            }
        }

        const resp = await axios.post(url, body)
        setImages(resp.data.images ?? [])
    }


    return(
        <Skeleton isLoaded={!isLoading}>
        <Stack spacing={3}>
            <Box p={6} display="flex" justifyContent="space-between" alignItems="center">
                <Text>Model</Text>
                <Select placeholder='Select Model' variant="outlined" value={selectedModel ?? ''} onChange={onModelChange}>     
                    {models.map((model) => 
                        (<option value={model.title}>{model.model_name}</option>)
                    )}
                </Select>
            </Box>
            <Box p={6} display="flex" justifyContent="space-between" alignItems="center">
                <Text>Script</Text>
                <Select placeholder='Select Script' variant="outlined" value={selectedScript ?? ''} onChange={onScriptChange}>     
                    {scripts.map((script) => 
                        (<option value={script}>{script}</option>)
                    )}
                </Select>
            </Box>
            <Box p={6} display="flex" justifyContent="space-between" alignItems="center">
                <Text>Prompt</Text>
                <Input variant='outline' onChange={onPromptChange} type="text" placeholder='Enter your prompt here' size='lg' value={prompt} />
            </Box>
            <Box p={6} display="flex" justifyContent="space-between" alignItems="center">
             <Text>Negative Prompt</Text>
             <Input variant='outline' onChange={onNegPromptChange} type="text" placeholder='Enter a negative prompt here' size='lg' value={negPrompt} />
            </Box>
            <Box p={6} display="flex" justifyContent="space-between" alignItems="center">
                <Text>Steps</Text>
                <Slider aria-label='slider-ex-6'm={4} min={5} max={50} value={steps} onChange={(val) => setSteps(val)}>
                    <SliderMark value={25} >
                    25
                    </SliderMark>
                    <SliderMark value={50}>
                    50
                    </SliderMark>            
                    <SliderMark
                    value={steps}
                    textAlign='center'
                    bg='blue.500'
                    color='white'
                    mt='-10'
                    ml='-3'
                    w='6'
                    borderRadius={'50%'}
                    >
                    {steps}
                    </SliderMark>
                    <SliderTrack>
                    <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>
            </Box>
            <IconButton aria-label='Send Prompt' onClick={onSubmitHandler} icon={<SearchIcon />} />
            {
                images.length > 0 && 
                (<Box p={6} display="flex" justifyContent="space-between" alignItems="center">
                    {images.map(
                        (image) => (<Image src={`data:image/jpeg;base64,${image}`}/>)
                    )}
                </Box>)
            }
    
            
        </Stack>
        </Skeleton>
    
    )


};

export default PromptEntry;