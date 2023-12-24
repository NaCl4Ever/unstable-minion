import { SearchIcon } from "@chakra-ui/icons";
import { Stack, Input, Text, IconButton, Box, Image, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Spinner, Skeleton, Select, Accordion, AccordionButton, AccordionIcon, AccordionPanel, AccordionItem } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";

export interface scriptInfo {
    name: string
    is_alwayson: boolean
    is_img2img: boolean
    args: scriptArgs[]
}
  
export interface scriptArgs {
label: string,
value: unknown,
minimum?: number,
maximum?: number,
step?: number,
choices?:  string[],
}
  



const PromptEntry = () => {
    const [prompt, setPrompt] = useState('');
    const [negPrompt, setNegPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [models, setModels] = useState<{title: 'string', model_name: 'string', hash: string}[]>([]);
    const [scripts, setScripts] = useState([]);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [selectedScript, setSelectedScript] = useState<string | null>(null);
    const [scriptInfo, setScriptInfo] = useState<scriptInfo[]>([]);
    const [scriptArgs, setScriptArgs] = useState<scriptArgs[]>([]);
    const [steps, setSteps] = useState(5)
    const onPromptChange = (ev: ChangeEvent<HTMLInputElement>) => setPrompt(ev.target.value);
    const onNegPromptChange = (ev: ChangeEvent<HTMLInputElement>) => setNegPrompt(ev.target.value);
    const onModelChange = (ev: ChangeEvent<HTMLSelectElement>) => setSelectedModel(ev.currentTarget.value);
    const onScriptChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        setSelectedScript(ev.currentTarget.value)
        const matchingInfo = scriptInfo.find(info => info.name === ev.currentTarget.value);
        if(matchingInfo) {
            setScriptArgs(matchingInfo.args);
        }

    };
   const onArgChange = (ev: any, arg: any, index: number) => {
    arg.value = ev.currentTarget.value;
    const replaceArgs = [...scriptArgs];
    replaceArgs.splice(index, 1, arg)
    setScriptArgs(replaceArgs);
   }
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
            const scriptInfoUrl = "http://127.0.0.1:7860/sdapi/v1/script-info";
            const scriptInfoResp = await axios.get(scriptInfoUrl)
            setScriptInfo(scriptInfoResp.data);
            setIsLoading(false);
        })()      

    }, [])

    const selectedScriptInfo = useMemo(() => {
        return selectedScript && scriptInfo.find(info => info.name === selectedScript)
    }, [selectedScript, scriptInfo])

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
            script_args?: any[];
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
        if(selectedScriptInfo) {
            body.script_args = scriptArgs
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
                    {models.map((model, index) => 
                        (<option key={index}value={model.title}>{model.model_name}</option>)
                    )}
                </Select>
            </Box>
            <Box p={6} display="flex" justifyContent="space-between" alignItems="center">
                <Text>Script</Text>
                <Select placeholder='Select Script' variant="outlined" value={selectedScript ?? ''} onChange={onScriptChange}>     
                    {scripts.map((script, index) => 
                        (<option key={`script-${index}`} value={script}>{script}</option>)
                    )}
                </Select>
            </Box>
            {
                selectedScriptInfo &&             
                        (<Box p={6} display="flex" justifyContent="space-between" alignItems="center" flexDirection="column">
                            <Text>Script Info</Text>
                            <Text>Name: {selectedScriptInfo.name}</Text>
                            <Text>Always On: {selectedScriptInfo.is_alwayson ? "Enabled" : "Disabled"}</Text>
                            <Text>Img 2 Img: {selectedScriptInfo.is_img2img ? "Enabled" : "Disabled"}</Text>
                            <Text>Arguments</Text>
                            {scriptArgs.map((arg, index) => 
                            (
                                <Box p={4} background="lightcoral" border="black 1px solid" display="flex" flexDirection="column" width="100%" key={index}>
                                    <Text>{arg.label}</Text>
                                    <Text>Value: {arg.value as any}</Text>
                                    {
                                        arg.choices && 
                                        <Select variant="outlined" value={arg.value as any} onChange={(ev) => onArgChange(ev, arg, index)}>     
                                        {arg.choices.map(choice => (
                                                <option value={choice}>{choice}</option>
                                        ))}
                                        </Select>
                                    }
                                </Box>
                            ))}
                        </Box>)

            }
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