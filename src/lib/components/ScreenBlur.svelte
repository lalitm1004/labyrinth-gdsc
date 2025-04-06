<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        document.body.style.overflow = 'hidden';
        return () => document.body.style.overflow = 'auto'
    })
</script>

<div class={`fixed top-0 left-0 h-dvh w-dvw grid place-items-center bg-black/80 backdrop-blur-sm z-50`}>
    <span class={`loader`}></span>
</div>

<style>
    .loader {
        width: 48px;
        height: 48px;
        border: 3px dotted #FFF;
        border-style: solid solid dotted dotted;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        animation: rotation 2s linear infinite;
    }
    
    .loader::after {
        content: '';  
        box-sizing: border-box;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        border: 3px dotted #0084D1;
        border-style: solid solid dotted;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        animation: rotationBack 1s linear infinite;
        transform-origin: center center;
    }
    
    @keyframes rotation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    } 
    @keyframes rotationBack {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(-360deg);
        }
    } 
</style>