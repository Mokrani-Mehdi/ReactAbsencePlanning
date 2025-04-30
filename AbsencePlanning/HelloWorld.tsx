import * as React from 'react';

export interface IHelloWorldProps {
  name?: string;
}

export class HelloWorld extends React.Component<IHelloWorldProps> {
  public render(): React.ReactNode {
    return (
     
        <span>Hello {this.props.name}!</span>
      
    )
  }
}
