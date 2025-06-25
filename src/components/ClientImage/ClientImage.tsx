'use client';

import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

type ClientImageProps = {
    src: string;
    thumbnail: string;
    className?: string;
}

export const ClientImage = ({ src, thumbnail, className}:ClientImageProps) => (
    <PhotoProvider>
        <PhotoView src={src}>
            <img src={thumbnail} alt="" className={className} />
        </PhotoView>
    </PhotoProvider>
);