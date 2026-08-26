import React from 'react';
import {describe,it,expect} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {App,projects} from './main.jsx';

describe('portfolio platform',()=>{
  it('renders all configured projects',()=>{
    render(<App/>);
    for(const project of projects){
      expect(screen.getByRole('heading',{name:project.title})).toBeInTheDocument();
      expect(screen.getByRole('progressbar',{name:`${project.title} readiness`})).toHaveAttribute('aria-valuenow',String(project.progress));
    }
  });

  it('filters projects by category',async()=>{
    const user=userEvent.setup();
    render(<App/>);
    await user.click(screen.getByRole('button',{name:'Math'}));
    expect(screen.getByRole('heading',{name:'Math Pattern Lab'})).toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:'CareTaxi'})).not.toBeInTheDocument();
  });

  it('searches project title and summary text',async()=>{
    const user=userEvent.setup();
    render(<App/>);
    await user.type(screen.getByRole('textbox',{name:'Search projects'}),'robotics');
    expect(screen.getByRole('heading',{name:'PROTECT Robotics'})).toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:'CareTaxi'})).not.toBeInTheDocument();
  });
});
