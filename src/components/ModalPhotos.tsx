"use client";

import React, { FC, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ButtonClose from "@/shared/ButtonClose";
import { Route } from "next";
import ListingImageGallery from "./listing-image-gallery/ListingImageGallery";
import { ListingGalleryImage } from "./listing-image-gallery/utils/types";

export interface ModalPhotosProps {
  photos?: string[];
  isOpen?: boolean;
  onClose?: () => void;
  initIndex?: number;
  uniqueClassName?: string;
}

const ModalPhotos: FC<ModalPhotosProps> = ({
  photos = [],
  isOpen = false,
  onClose,
  initIndex = 0,
  uniqueClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<ListingGalleryImage[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (photos && photos.length > 0) {
      setGalleryImages(
        photos.map((item, index) => ({
          id: index,
          url: item,
        }))
      );
    }
  }, [photos]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setOpen(false);
      // Remove the 'modal' query parameter from the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("modal");
      router.push(`${pathname}?${params.toString()}` as Route);
    }
  };

  const renderContent = () => {
    return (
      <div className={`nc-ModalPhotos ${uniqueClassName}`} data-nc-id="ModalPhotos">
        <div className="relative">
          <div className="absolute z-20 right-3 top-3">
            <ButtonClose onClick={handleClose} />
          </div>
          <ListingImageGallery 
            images={galleryImages} 
            onClose={handleClose} 
            isShowModal={open}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-50"
      onClose={handleClose}
      open={open}
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80" />
        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block w-full max-w-5xl my-5 overflow-hidden text-left align-middle transition-all transform rounded-2xl">
          {renderContent()}
        </div>
      </div>
    </Dialog>
  );
};

export default ModalPhotos; 