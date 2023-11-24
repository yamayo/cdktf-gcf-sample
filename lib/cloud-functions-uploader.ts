import * as path from 'node:path'
import { DataArchiveFile } from '@cdktf/provider-archive/lib/data-archive-file'
import { StorageBucket } from '@cdktf/provider-google/lib/storage-bucket'
import { StorageBucketObject } from '@cdktf/provider-google/lib/storage-bucket-object'
import { Construct } from 'constructs'

export interface CloudFunctionsUploaderProps {
  functionName: string
  uploadBucket: StorageBucket
}

export class CloudFunctionsUploader extends Construct {
  readonly uploadObject: StorageBucketObject

  constructor(
    scope: Construct,
    id: string,
    props: CloudFunctionsUploaderProps,
  ) {
    super(scope, id)

    const functionsPath = path.resolve(
      __dirname,
      '..',
      'functions',
      props.functionName,
    )
    const outputFileName = `${props.functionName}.zip`
    const code = new DataArchiveFile(
      this,
      `${props.functionName}-archive-file`,
      {
        type: 'zip',
        sourceDir: functionsPath,
        outputPath: path.resolve(
          __dirname,
          '..',
          'cdktf.out',
          'functions',
          'out',
          outputFileName,
        ),
        excludes: ['dist', '.gitignore', 'node_modules'],
      },
    )

    const uploadObject = new StorageBucketObject(
      this,
      `${props.functionName}-upload-object`,
      {
        name: code.outputMd5,
        bucket: props.uploadBucket.name,
        source: code.outputPath,
      },
    )

    this.uploadObject = uploadObject
  }
}
