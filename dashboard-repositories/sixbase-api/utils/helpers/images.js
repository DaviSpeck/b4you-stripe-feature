const sharp = require('sharp');
const sizes = require('../../config/imageSizes');

class Images {
  constructor(helper) {
    this.helper = helper;
    this.CONFIG = sizes;
  }

  async cover(filePath, _options) {
    // const image = await this.helper(filePath)
    //   .resize(options.width, options.height, {
    //     fit: this.helper.fit.cover,
    //   })
    //   .toBuffer();
    const image = await this.helper(filePath)
      // .resize(options.width, options.height, {
      //   fit: this.helper.fit.cover,
      // })
      .toBuffer();
    return image;
  }

  async toBuffer(filePath) {
    const image = await this.helper(filePath).toBuffer();
    return image;
  }

  async scaleToFit(filePath, _options) {
    // const image = await this.helper(filePath)
    //   .resize(options.width, options.height, {
    //     fit: this.helper.fit.inside,
    //   })
    //   .toBuffer();
    const image = await this.helper(filePath)
      // .resize(options.width, options.height, {
      //   fit: this.helper.fit.inside,
      // })
      .toBuffer();
    return image;
  }

  async getImageDimensions(filePath) {
    const { width, height } = await this.helper(filePath).metadata();
    return { width, height };
  }

  async formatImageCover(filePath, options) {
    const image = await this.scaleToFit(filePath, options);
    return image;
  }

  async formatImageThumbnail(filePath, options) {
    const image = await this.cover(filePath, {
      width: this.CONFIG.PRODUCT_COVER.width,
      height: this.CONFIG.PRODUCT_COVER.height,
    });
    const thumbnail = await this.cover(image, options);
    return thumbnail;
  }

  async formatImageLogo(filePath, options) {
    const image = await this.scaleToFit(filePath, options);
    return image;
  }

  async formatImageStudent(filePath, options) {
    const image = await this.cover(filePath, options);
    return image;
  }

  async formatImageProducer(filePath, options) {
    const image = await this.cover(filePath, options);
    return image;
  }

  async resizeImageHeaderDesktop(filePath, options) {
    const image = await this.scaleToFit(filePath, options);
    return image;
  }

  async resizeImageSidebar(filePath, options) {
    const image = await this.cover(filePath, options);
    return image;
  }

  async resizeHeaderMobile(filePath, options) {
    const image = await this.scaleToFit(filePath, options);
    return image;
  }

  async resizeFavicon(filePath, options) {
    const image = await this.scaleToFit(filePath, options);
    return image;
  }

  async generateCertificate(file, full_name) {
    const image = await this.helper(file);
    await image.overlayWith(full_name, { gravity: 'center' });
    return image.toBuffer();
  }
}

module.exports = new Images(sharp);
