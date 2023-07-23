from fal_serverless import isolated, cached

requirements = [
    "transformers",
    "sentencepiece",
    "accelerate",
    "fal_serverless",
    "torch==2.0",
    "numpy",
    "tokenizers>=0.12.1",
    "fastapi",
    "uvicorn",
]

@cached
def load_model():
    import os
    cache_dir = "/data/hfcache"
    os.environ["TRANSFORMERS_CACHE"] = cache_dir

    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM

    print(torch.__version__)
    tokenizer = AutoTokenizer.from_pretrained(
        "TheBloke/vicuna-13B-1.1-HF", use_fast=False, cache_dir=cache_dir
    )
    model = AutoModelForCausalLM.from_pretrained(
        "TheBloke/vicuna-13B-1.1-HF",
        low_cpu_mem_usage=True,
        torch_dtype=torch.float16,
        cache_dir=cache_dir,
    )
    model.to("cuda")
    return tokenizer, model

# @isolated(requirements=requirements, machine_type="GPU", keep_alive=300)
# def llm(prompt):
#     import os
#     import torch
#     from transformers import TextStreamer
#     print(torch.__version__)
#     with torch.inference_mode():
#         tokenizer, model = load_model()
#         # print(os.environ["TRANSFORMERS_CACHE"])
#         streamer = TextStreamer(tokenizer, skip_prompt=True)
#         # streamer = TextIteratorStreamer(tokenizer, skip_prompt=True)
#         input_ids = tokenizer([prompt]).input_ids
#         output_ids = model.generate(
#             torch.as_tensor(input_ids).cuda(),
#             do_sample=True,
#             temperature=0.7,
#             max_new_tokens=512,
#             streamer=streamer,
#         )
#         # streamer.
#         output_ids = output_ids[0][len(input_ids[0]) :]
#         outputs = tokenizer.decode(
#             output_ids, skip_special_tokens=True, spaces_between_special_tokens=False
#         )
#         return outputs

@isolated(requirements=requirements, machine_type="GPU", keep_alive=300, exposed_port=8080)
def chat_app():
    from fastapi import FastAPI, WebSocket
    from fastapi.responses import StreamingResponse
    from pydantic import BaseModel
    from transformers import TextIteratorStreamer
    # from uuid import uuid4
    # import asyncio
    import os
    import torch
    import uvicorn

    app = FastAPI()

    # __tasks: dict[str, asyncio.Task] = {}

    class ChatInput(BaseModel):
        prompt: str

    async def __process_prompt(prompt: str):
        print(torch.__version__)
        os.environ["TRANSFORMERS_CACHE"] = "/data/hfcache"
        with torch.inference_mode():
            tokenizer, model = load_model()
            streamer = TextIteratorStreamer(
                tokenizer,
                skip_prompt=True,
                # Decoder's parameters
                skip_special_tokens=True,
                spaces_between_special_tokens=False
            )
            input_ids = tokenizer([prompt]).input_ids
            output_ids = model.generate(
                torch.as_tensor(input_ids).cuda(),
                do_sample=True,
                temperature=0.7,
                max_new_tokens=512,
                streamer=streamer,
            )
            for content in streamer:
                print("content", content)
                yield content
            # output_ids = output_ids[0][len(input_ids[0]) :]
            # outputs = tokenizer.decode(
            #     output_ids, skip_special_tokens=True, spaces_between_special_tokens=False
            # )
            # yield outputs

    @app.post("/chat")
    async def process_prompt(input: ChatInput):
        return StreamingResponse(
            __process_prompt(input.prompt),
            media_type="text/plain",
            # chunk_size=None,
        )
        # start the thing
        # try:
        #   chat_id = str(uuid4())
        #   task = asyncio.create_task(__process_prompt(input.prompt))
        #   # tasks.add_task(__process_prompt, input.prompt)
        #   __tasks[chat_id] = task
        #   return chat_id
        # except Exception as e:
        #   print(e)
        #   return { "state": "error", "message": str(e), "error_type": type(e).__name__ }

    @app.websocket("/chat/ws")
    async def auto_complete(websocket: WebSocket):
        await websocket.accept()
        prompt = await websocket.receive_text()

        async for content in __process_prompt(prompt):
            await websocket.send_text(content)
        # task = __tasks[chat_id]
        # if task.done():
        #     # how to get the final result?
        #     websocket.close()
        #     return
        # async for content in task:
        #     await websocket.send_text(content)
        # await task
        # websocket.close()

    uvicorn.run(app, host="0.0.0.0", port=8080)


# if __name__ == "__main__":
    # chat_app()
  # print(llm("give me a list of restaurants in the Seattle Area (including Woodinville, Kirkland and Bellevue) with outdoor dinning, during summer for a 3 day trip"))
  # print(llm("What are the top 10 football teams in England?"))
