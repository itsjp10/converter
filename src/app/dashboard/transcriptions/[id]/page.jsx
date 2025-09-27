

export default async function SingleTranscription({ params }){
    const id = await params;
    return(
        <h1>This is transcription with id: {id}</h1>
    )
}